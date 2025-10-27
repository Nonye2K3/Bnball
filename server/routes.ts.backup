import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, insertTransactionSchema, insertPredictionMarketSchema } from "@shared/schema";
import { z } from "zod";

// Logging utility
function logRequest(method: string, path: string, data?: any) {
  console.log(`[${new Date().toISOString()}] ${method} ${path}`, data ? JSON.stringify(data) : '');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // POST /api/bets - Create new bet record after blockchain transaction
  app.post("/api/bets", async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/bets', req.body);
      
      // Validate request body
      const validatedData = insertBetSchema.parse(req.body);
      
      // Check for duplicate transaction hash to prevent race conditions
      const existingBet = await storage.getBetByTransactionHash(validatedData.transactionHash);
      if (existingBet) {
        logRequest('POST', '/api/bets', { error: 'Duplicate transaction hash', txHash: validatedData.transactionHash });
        return res.status(409).json({ 
          error: "Bet with this transaction hash already exists",
          betId: existingBet.id 
        });
      }
      
      // Create bet
      const bet = await storage.createBet(validatedData);
      logRequest('POST', '/api/bets', { success: true, betId: bet.id });
      
      return res.status(201).json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logRequest('POST', '/api/bets', { error: 'Validation error', details: error.errors });
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error('Error creating bet:', error);
      return res.status(500).json({ 
        error: "Failed to create bet",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/bets/:userAddress - Get user's betting history
  app.get("/api/bets/:userAddress", async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      logRequest('GET', `/api/bets/${userAddress}`);
      
      // Validate address format (basic validation)
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(400).json({ 
          error: "Invalid wallet address format" 
        });
      }
      
      const bets = await storage.getBetsByUser(userAddress);
      return res.json(bets);
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return res.status(500).json({ 
        error: "Failed to fetch bets",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
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
      console.error('Error claiming bet:', error);
      return res.status(500).json({ 
        error: "Failed to claim bet",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/transactions - Record transaction
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/transactions', req.body);
      
      // Validate request body
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Check for duplicate transaction hash to prevent race conditions
      const existingTx = await storage.getTransactionByHash(validatedData.transactionHash);
      if (existingTx) {
        logRequest('POST', '/api/transactions', { error: 'Duplicate transaction hash', txHash: validatedData.transactionHash });
        return res.status(409).json({ 
          error: "Transaction with this hash already exists",
          transactionId: existingTx.id 
        });
      }
      
      // Create transaction
      const transaction = await storage.createTransaction(validatedData);
      logRequest('POST', '/api/transactions', { success: true, txId: transaction.id });
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logRequest('POST', '/api/transactions', { error: 'Validation error', details: error.errors });
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error('Error creating transaction:', error);
      return res.status(500).json({ 
        error: "Failed to create transaction",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/transactions/:userAddress - Get user's transaction history
  app.get("/api/transactions/:userAddress", async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      logRequest('GET', `/api/transactions/${userAddress}`);
      
      // Validate address format (basic validation)
      if (!userAddress || !userAddress.startsWith('0x')) {
        return res.status(400).json({ 
          error: "Invalid wallet address format" 
        });
      }
      
      const transactions = await storage.getTransactionsByUser(userAddress);
      return res.json(transactions);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return res.status(500).json({ 
        error: "Failed to fetch transactions",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/markets - Create market with blockchain data
  app.post("/api/markets", async (req: Request, res: Response) => {
    try {
      logRequest('POST', '/api/markets', req.body);
      
      // Validate request body
      const validatedData = insertPredictionMarketSchema.parse(req.body);
      
      // Check for duplicate transaction hash if provided
      if (validatedData.transactionHash) {
        const existingMarkets = await storage.getAllPredictionMarkets();
        const duplicateMarket = existingMarkets.find(
          m => m.transactionHash === validatedData.transactionHash
        );
        
        if (duplicateMarket) {
          logRequest('POST', '/api/markets', { error: 'Duplicate transaction hash', txHash: validatedData.transactionHash });
          return res.status(409).json({ 
            error: "Market with this transaction hash already exists",
            marketId: duplicateMarket.id 
          });
        }
      }
      
      // Create market
      const market = await storage.createPredictionMarket(validatedData);
      logRequest('POST', '/api/markets', { success: true, marketId: market.id });
      
      return res.status(201).json(market);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logRequest('POST', '/api/markets', { error: 'Validation error', details: error.errors });
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error('Error creating market:', error);
      return res.status(500).json({ 
        error: "Failed to create market",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
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
      if (error instanceof z.ZodError) {
        logRequest('PATCH', `/api/markets/${id}`, { error: 'Validation error', details: error.errors });
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error('Error updating market:', error);
      return res.status(500).json({ 
        error: "Failed to update market",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
