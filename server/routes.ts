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

  const httpServer = createServer(app);

  return httpServer;
}
