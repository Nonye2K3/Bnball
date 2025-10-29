import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, insertTransactionSchema, insertPredictionMarketSchema } from "@shared/schema";
import { z } from "zod";
import { verifyWalletAddress, requireWalletOwnership } from "./middleware";
import { 
  verifyTransactionExists, 
  verifyTransactionSender, 
  verifyTransactionValue,
  logSecurityEvent 
} from "./blockchain";
import { TwitterApi } from 'twitter-api-v2';
import { oddsApiService } from "./services/oddsApi";

// Logging utility
function logRequest(method: string, path: string, data?: any) {
  console.log(`[${new Date().toISOString()}] ${method} ${path}`, data ? JSON.stringify(data) : '');
}

// Generic error handler that hides internal details
function handleError(res: Response, error: any, operation: string, statusCode: number = 500) {
  // Log the full error for debugging
  console.error(`Error in ${operation}:`, error);
  
  // Return generic error message to client
  if (error instanceof z.ZodError) {
    logSecurityEvent('VALIDATION_FAILED', {
      operation,
      errors: error.errors
    });
    return res.status(400).json({ 
      error: "Validation failed",
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }
  
  // Don't expose internal error details
  return res.status(statusCode).json({ 
    error: `Failed to ${operation}`,
    message: "An error occurred. Please try again later."
  });
}

// Sample markets removed - platform now uses only live data from TheOddsAPI

export async function registerRoutes(app: Express): Promise<Server> {
  
  // POST /api/bets - Create new bet record after blockchain transaction
  app.post("/api/bets", verifyWalletAddress, requireWalletOwnership, async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/bets', req.body);
      
      // Validate request body with enhanced schema
      const validatedData = insertBetSchema.parse(req.body);
      
      // Step 1: Check for duplicate transaction hash to prevent race conditions
      const existingBet = await storage.getBetByTransactionHash(validatedData.transactionHash);
      if (existingBet) {
        logSecurityEvent('DUPLICATE_BET_TRANSACTION', {
          txHash: validatedData.transactionHash,
          existingBetId: existingBet.id
        });
        return res.status(409).json({ 
          error: "Bet with this transaction hash already exists",
          betId: existingBet.id 
        });
      }
      
      // Step 2: Verify market exists
      const market = await storage.getPredictionMarket(validatedData.marketId);
      if (!market) {
        logSecurityEvent('INVALID_MARKET_ID', {
          marketId: validatedData.marketId,
          userAddress: validatedData.userAddress
        });
        return res.status(404).json({ 
          error: "Market not found",
          message: "The specified market does not exist"
        });
      }
      
      // Step 3: Verify transaction exists on blockchain
      const { exists, receipt } = await verifyTransactionExists(
        validatedData.transactionHash as `0x${string}`,
        validatedData.chainId
      );
      
      if (!exists) {
        logSecurityEvent('TRANSACTION_NOT_FOUND', {
          txHash: validatedData.transactionHash,
          chainId: validatedData.chainId,
          userAddress: validatedData.userAddress
        });
        return res.status(400).json({ 
          error: "Invalid transaction",
          message: "Transaction not found on blockchain or failed"
        });
      }
      
      // Step 4: Verify transaction sender matches user address
      const { valid: validSender, actualSender } = await verifyTransactionSender(
        validatedData.transactionHash as `0x${string}`,
        validatedData.chainId,
        validatedData.userAddress as `0x${string}`
      );
      
      if (!validSender) {
        logSecurityEvent('SENDER_VERIFICATION_FAILED', {
          txHash: validatedData.transactionHash,
          expectedSender: validatedData.userAddress,
          actualSender
        });
        return res.status(403).json({ 
          error: "Unauthorized transaction",
          message: "Transaction sender does not match your wallet address"
        });
      }
      
      // Step 5: Verify transaction value matches bet amount
      const { valid: validValue, actualValue } = await verifyTransactionValue(
        validatedData.transactionHash as `0x${string}`,
        validatedData.chainId,
        validatedData.amount
      );
      
      if (!validValue) {
        logSecurityEvent('VALUE_VERIFICATION_FAILED', {
          txHash: validatedData.transactionHash,
          expectedValue: validatedData.amount,
          actualValue
        });
        return res.status(400).json({ 
          error: "Amount mismatch",
          message: "Transaction amount does not match your bet amount"
        });
      }
      
      // All validations passed - create bet
      const bet = await storage.createBet(validatedData);
      logRequest('POST', '/api/bets', { success: true, betId: bet.id });
      
      return res.status(201).json(bet);
    } catch (error) {
      return handleError(res, error, 'create bet');
    }
  });

  // GET /api/bets/:userAddress - Get user's betting history
  app.get("/api/bets/:userAddress", async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      logRequest('GET', `/api/bets/${userAddress}`);
      
      // Validate address format (basic validation)
      if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({ 
          error: "Invalid wallet address format" 
        });
      }
      
      const bets = await storage.getBetsByUser(userAddress);
      return res.json(bets);
    } catch (error) {
      return handleError(res, error, 'fetch bets');
    }
  });

  // PATCH /api/bets/:id/claim - Mark bet as claimed
  app.patch("/api/bets/:id/claim", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { claimTransactionHash } = req.body;
      
      logRequest('PATCH', `/api/bets/${id}/claim`, { claimTransactionHash });
      
      if (!claimTransactionHash) {
        return res.status(400).json({ 
          error: "claimTransactionHash is required" 
        });
      }
      
      // Validate transaction hash format
      if (!claimTransactionHash.match(/^0x[a-fA-F0-9]{64}$/)) {
        return res.status(400).json({ 
          error: "Invalid transaction hash format" 
        });
      }
      
      // Get existing bet
      const existingBet = await storage.getBet(id);
      if (!existingBet) {
        return res.status(404).json({ 
          error: "Bet not found" 
        });
      }
      
      // Check if already claimed
      if (existingBet.claimed) {
        return res.status(409).json({ 
          error: "Bet already claimed",
          claimTransactionHash: existingBet.claimTransactionHash 
        });
      }
      
      // Update bet
      const updatedBet = await storage.updateBet(id, {
        claimed: true,
        claimTransactionHash
      });
      
      if (!updatedBet) {
        return res.status(500).json({ 
          error: "Failed to update bet" 
        });
      }
      
      logRequest('PATCH', `/api/bets/${id}/claim`, { success: true });
      return res.json(updatedBet);
    } catch (error) {
      return handleError(res, error, 'claim bet');
    }
  });

  // POST /api/transactions - Record transaction
  app.post("/api/transactions", verifyWalletAddress, requireWalletOwnership, async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/transactions', req.body);
      
      // Validate request body with enhanced schema
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Step 1: Check for duplicate transaction hash to prevent race conditions
      const existingTx = await storage.getTransactionByHash(validatedData.transactionHash);
      if (existingTx) {
        logSecurityEvent('DUPLICATE_TRANSACTION', {
          txHash: validatedData.transactionHash,
          existingTxId: existingTx.id
        });
        return res.status(409).json({ 
          error: "Transaction with this hash already exists",
          transactionId: existingTx.id 
        });
      }
      
      // Step 2: Verify transaction exists on blockchain
      const { exists } = await verifyTransactionExists(
        validatedData.transactionHash as `0x${string}`,
        validatedData.chainId
      );
      
      if (!exists) {
        logSecurityEvent('TRANSACTION_NOT_FOUND', {
          txHash: validatedData.transactionHash,
          chainId: validatedData.chainId,
          userAddress: validatedData.userAddress
        });
        return res.status(400).json({ 
          error: "Invalid transaction",
          message: "Transaction not found on blockchain or failed"
        });
      }
      
      // Step 3: Verify transaction sender matches user address
      const { valid: validSender } = await verifyTransactionSender(
        validatedData.transactionHash as `0x${string}`,
        validatedData.chainId,
        validatedData.userAddress as `0x${string}`
      );
      
      if (!validSender) {
        logSecurityEvent('SENDER_VERIFICATION_FAILED', {
          txHash: validatedData.transactionHash,
          expectedSender: validatedData.userAddress
        });
        return res.status(403).json({ 
          error: "Unauthorized transaction",
          message: "Transaction sender does not match your wallet address"
        });
      }
      
      // All validations passed - create transaction record
      const transaction = await storage.createTransaction(validatedData);
      logRequest('POST', '/api/transactions', { success: true, txId: transaction.id });
      
      return res.status(201).json(transaction);
    } catch (error) {
      return handleError(res, error, 'create transaction');
    }
  });

  // GET /api/transactions/:userAddress - Get user's transaction history
  app.get("/api/transactions/:userAddress", async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      logRequest('GET', `/api/transactions/${userAddress}`);
      
      // Validate address format
      if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({ 
          error: "Invalid wallet address format" 
        });
      }
      
      const transactions = await storage.getTransactionsByUser(userAddress);
      return res.json(transactions);
    } catch (error) {
      return handleError(res, error, 'fetch transactions');
    }
  });

  // POST /api/markets - Create market with blockchain data
  app.post("/api/markets", verifyWalletAddress, async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/markets', req.body);
      
      // Validate request body
      const validatedData = insertPredictionMarketSchema.parse(req.body);
      
      // Validate creator address if provided
      if (validatedData.creatorAddress) {
        if (!validatedData.creatorAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
          return res.status(400).json({ 
            error: "Invalid creator address format" 
          });
        }
      }
      
      // Check for duplicate transaction hash if provided
      if (validatedData.transactionHash) {
        // Validate transaction hash format
        if (!validatedData.transactionHash.match(/^0x[a-fA-F0-9]{64}$/)) {
          return res.status(400).json({ 
            error: "Invalid transaction hash format" 
          });
        }
        
        const existingMarkets = await storage.getAllPredictionMarkets();
        const duplicateMarket = existingMarkets.find(
          m => m.transactionHash === validatedData.transactionHash
        );
        
        if (duplicateMarket) {
          logSecurityEvent('DUPLICATE_MARKET_TRANSACTION', {
            txHash: validatedData.transactionHash,
            existingMarketId: duplicateMarket.id
          });
          return res.status(409).json({ 
            error: "Market with this transaction hash already exists",
            marketId: duplicateMarket.id 
          });
        }
        
        // Verify transaction exists on blockchain if chainId is provided
        if (validatedData.chainId) {
          const { exists } = await verifyTransactionExists(
            validatedData.transactionHash as `0x${string}`,
            validatedData.chainId
          );
          
          if (!exists) {
            logSecurityEvent('MARKET_TRANSACTION_NOT_FOUND', {
              txHash: validatedData.transactionHash,
              chainId: validatedData.chainId
            });
            return res.status(400).json({ 
              error: "Invalid transaction",
              message: "Transaction not found on blockchain or failed"
            });
          }
        }
      }
      
      // Validate deadline is in the future
      if (validatedData.deadline && new Date(validatedData.deadline) < new Date()) {
        return res.status(400).json({ 
          error: "Invalid deadline",
          message: "Market deadline must be in the future"
        });
      }
      
      // Create market
      const market = await storage.createPredictionMarket(validatedData);
      logRequest('POST', '/api/markets', { success: true, marketId: market.id });
      
      return res.status(201).json(market);
    } catch (error) {
      return handleError(res, error, 'create market');
    }
  });

  // PATCH /api/markets/:id - Update market with blockchain data
  app.patch("/api/markets/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      logRequest('PATCH', `/api/markets/${id}`, req.body);
      
      // Get existing market
      const existingMarket = await storage.getPredictionMarket(id);
      if (!existingMarket) {
        return res.status(404).json({ 
          error: "Market not found" 
        });
      }
      
      // Validate update data (partial schema)
      const updateSchema = insertPredictionMarketSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      // Update market
      const updatedMarket = await storage.updatePredictionMarket(id, validatedData);
      
      if (!updatedMarket) {
        return res.status(500).json({ 
          error: "Failed to update market" 
        });
      }
      
      logRequest('PATCH', `/api/markets/${id}`, { success: true });
      return res.json(updatedMarket);
    } catch (error) {
      return handleError(res, error, 'update market');
    }
  });

  // GET /api/markets - Get all markets
  app.get("/api/markets", async (req: Request, res: Response) => {
    try {
      const markets = await storage.getAllPredictionMarkets();
      return res.json(markets);
    } catch (error) {
      return handleError(res, error, 'fetch markets');
    }
  });

  // POST /api/markets/sync-sports - Sync live sports data from TheOddsAPI
  app.post("/api/markets/sync-sports", async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/markets/sync-sports');
      
      const liveMatches = await oddsApiService.getAllUpcomingMatches();
      const createdMarkets = [];
      const updatedMarkets = [];
      
      // Only use live data from TheOddsAPI - no sample/mock data
      if (liveMatches.length === 0) {
        console.log('No live matches available from TheOddsAPI');
        return res.json({
          message: 'No live matches available',
          created: 0,
          updated: 0,
          total: 0,
          source: 'live'
        });
      }
      
      for (const matchData of liveMatches) {
        // Check if market already exists for this event
        const existingMarkets = await storage.getAllPredictionMarkets();
        const existingMarket = existingMarkets.find(
          m => m.oddsApiEventId === matchData.oddsApiEventId
        );
        
        if (!existingMarket) {
          // Create new market
          const market = await storage.createPredictionMarket(matchData as any);
          createdMarkets.push(market);
        } else {
          // Update existing market odds
          const updatedMarketData = await oddsApiService.updateMarketOdds(existingMarket);
          if (updatedMarketData) {
            await storage.updatePredictionMarket(existingMarket.id, updatedMarketData);
            updatedMarkets.push(existingMarket.id);
          }
        }
      }
      
      return res.json({
        message: `Synced ${liveMatches.length} live matches from TheOddsAPI`,
        created: createdMarkets.length,
        updated: updatedMarkets.length,
        total: liveMatches.length,
        source: 'live'
      });
    } catch (error) {
      return handleError(res, error, 'sync sports data');
    }
  });

  // GET /api/markets/:id - Get market by ID
  app.get("/api/markets/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const market = await storage.getPredictionMarket(id);
      
      if (!market) {
        return res.status(404).json({ 
          error: "Market not found" 
        });
      }
      
      return res.json(market);
    } catch (error) {
      return handleError(res, error, 'fetch market');
    }
  });

  // GET /api/social/win-data/:betId - Get win data for generating share image
  app.get("/api/social/win-data/:betId", verifyWalletAddress, async (req: Request, res: Response) => {
    try {
      const { betId } = req.params;
      const walletAddress = req.validatedUserAddress!;
      
      logRequest('GET', `/api/social/win-data/${betId}`);
      
      // Get bet data
      const bet = await storage.getBet(betId);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      
      // Verify bet belongs to user
      if (bet.userAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(403).json({ error: "Not authorized to access this bet" });
      }
      
      const market = await storage.getPredictionMarket(bet.marketId);
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      
      // Check if bet won
      if (market.status !== 'completed' || market.result === null) {
        return res.status(400).json({ error: "Market not yet resolved" });
      }
      
      const betWon = (bet.prediction && market.result) || (!bet.prediction && !market.result);
      if (!betWon) {
        return res.status(400).json({ error: "This bet did not win" });
      }
      
      // Calculate win amount (simplified - in production would come from blockchain)
      const stakeAmount = BigInt(bet.amount);
      const odds = bet.prediction ? parseFloat(market.yesOdds) : parseFloat(market.noOdds);
      const winAmount = stakeAmount * BigInt(Math.floor(odds * 100)) / BigInt(100);
      const multiplier = odds;
      
      // Return data for frontend to generate image
      return res.json({
        success: true,
        data: {
          marketTitle: market.title,
          prediction: bet.prediction ? 'YES' : 'NO',
          stakeAmount: bet.amount,
          winAmount: winAmount.toString(),
          multiplier,
          username: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
          betId: bet.id,
          marketId: market.id
        }
      });
    } catch (error) {
      return handleError(res, error, 'fetch win data');
    }
  });

  // POST /api/social/share-to-x - Post win to X/Twitter
  app.post("/api/social/share-to-x", verifyWalletAddress, async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/social/share-to-x', req.body);
      
      const schema = z.object({
        imageBuffer: z.string(), // base64 encoded image
        text: z.string(),
        marketTitle: z.string(),
        winAmount: z.string()
      });
      
      const { imageBuffer, text, marketTitle, winAmount } = schema.parse(req.body);
      
      // Check for X API credentials
      const apiKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
      const apiSecret = process.env.X_API_SECRET || process.env.TWITTER_API_SECRET;
      const accessToken = process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
      const accessSecret = process.env.X_ACCESS_SECRET || process.env.TWITTER_ACCESS_SECRET;
      
      if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
        return res.status(503).json({ 
          error: "X/Twitter integration not configured",
          message: "Please contact support to enable X posting"
        });
      }
      
      // Initialize Twitter client
      const twitterClient = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });
      
      // Upload image
      const imageData = Buffer.from(imageBuffer, 'base64');
      const mediaId = await twitterClient.v1.uploadMedia(imageData, { mimeType: 'image/png' });
      
      // Post tweet
      const tweet = await twitterClient.v2.tweet({
        text: text,
        media: { media_ids: [mediaId] }
      });
      
      logRequest('POST', '/api/social/share-to-x', { success: true, tweetId: tweet.data.id });
      
      return res.json({
        success: true,
        tweetId: tweet.data.id,
        tweetUrl: `https://twitter.com/i/web/status/${tweet.data.id}`
      });
    } catch (error: any) {
      console.error('X posting error:', error);
      return res.status(500).json({ 
        error: "Failed to post to X",
        message: error.message || "Please try again later"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
