import {
  type User,
  type InsertUser,
  type PredictionMarket,
  type InsertPredictionMarket,
  type Bet,
  type InsertBet,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Prediction Market methods
  getPredictionMarket(id: string): Promise<PredictionMarket | undefined>;
  getAllPredictionMarkets(): Promise<PredictionMarket[]>;
  getPredictionMarketsByCategory(category: string): Promise<PredictionMarket[]>;
  getPredictionMarketsByCreator(
    creatorAddress: string,
  ): Promise<PredictionMarket[]>;
  createPredictionMarket(
    market: InsertPredictionMarket,
  ): Promise<PredictionMarket>;
  updatePredictionMarket(
    id: string,
    market: Partial<PredictionMarket>,
  ): Promise<PredictionMarket | undefined>;

  // Bet methods
  getBet(id: string): Promise<Bet | undefined>;
  getBetsByMarket(marketId: string): Promise<Bet[]>;
  getBetsByUser(userAddress: string): Promise<Bet[]>;
  getBetByTransactionHash(transactionHash: string): Promise<Bet | undefined>;
  getBetByTaxTransactionHash(
    taxTransactionHash: string,
  ): Promise<Bet | undefined>;
  getRefundEligibleBets(): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(id: string, bet: Partial<Bet>): Promise<Bet | undefined>;

  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByHash(
    transactionHash: string,
  ): Promise<Transaction | undefined>;
  getTransactionsByUser(userAddress: string): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(
    id: string,
    transaction: Partial<Transaction>,
  ): Promise<Transaction | undefined>;

  // Platform Statistics
  getPlatformStats(): Promise<{
    totalVolume: string;
    liveMarketsCount: number;
    activeUsersCount: number;
    totalPrizePool: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private predictionMarkets: Map<string, PredictionMarket>;
  private bets: Map<string, Bet>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.users = new Map();
    this.predictionMarkets = new Map();
    this.bets = new Map();
    this.transactions = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Prediction Market methods
  async getPredictionMarket(id: string): Promise<PredictionMarket | undefined> {
    return this.predictionMarkets.get(id);
  }

  async getAllPredictionMarkets(): Promise<PredictionMarket[]> {
    return Array.from(this.predictionMarkets.values());
  }

  async getPredictionMarketsByCategory(
    category: string,
  ): Promise<PredictionMarket[]> {
    return Array.from(this.predictionMarkets.values()).filter(
      (market) => market.category === category,
    );
  }

  async getPredictionMarketsByCreator(
    creatorAddress: string,
  ): Promise<PredictionMarket[]> {
    return Array.from(this.predictionMarkets.values()).filter(
      (market) => market.creatorAddress === creatorAddress,
    );
  }

  async createPredictionMarket(
    insertMarket: InsertPredictionMarket,
  ): Promise<PredictionMarket> {
    const id = randomUUID();
    const market: PredictionMarket = {
      id,
      title: insertMarket.title,
      description: insertMarket.description,
      category: insertMarket.category,
      status: insertMarket.status ?? "live",
      startTime: insertMarket.startTime,
      deadline: insertMarket.deadline,
      resolutionMethod: insertMarket.resolutionMethod,
      totalPool: insertMarket.totalPool ?? "0",
      yesOdds: insertMarket.yesOdds ?? "50",
      noOdds: insertMarket.noOdds ?? "50",
      participants: insertMarket.participants ?? 0,
      result: insertMarket.result ?? null,
      resolutionData: insertMarket.resolutionData ?? null,
      contractMarketId: insertMarket.contractMarketId ?? null,
      transactionHash: insertMarket.transactionHash ?? null,
      chainId: insertMarket.chainId ?? null,
      creatorAddress: insertMarket.creatorAddress ?? null,
      yesPoolOnChain: insertMarket.yesPoolOnChain ?? null,
      noPoolOnChain: insertMarket.noPoolOnChain ?? null,
      resolvedTransactionHash: insertMarket.resolvedTransactionHash ?? null,
      resolvedAt: insertMarket.resolvedAt ?? null,
      oddsApiEventId: insertMarket.oddsApiEventId ?? null,
      apiFootballFixtureId: insertMarket.apiFootballFixtureId ?? null,
      homeTeam: insertMarket.homeTeam ?? null,
      awayTeam: insertMarket.awayTeam ?? null,
      sport: insertMarket.sport ?? null,
      league: insertMarket.league ?? null,
      bookmaker: insertMarket.bookmaker ?? null,
      lastOddsUpdate: insertMarket.lastOddsUpdate ?? null,
    };
    this.predictionMarkets.set(id, market);
    return market;
  }

  async updatePredictionMarket(
    id: string,
    updates: Partial<PredictionMarket>,
  ): Promise<PredictionMarket | undefined> {
    const market = this.predictionMarkets.get(id);
    if (!market) return undefined;

    const updatedMarket = { ...market, ...updates };
    this.predictionMarkets.set(id, updatedMarket);
    return updatedMarket;
  }

  // Bet methods
  async getBet(id: string): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async getBetsByMarket(marketId: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.marketId === marketId,
    );
  }

  async getBetsByUser(userAddress: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.userAddress === userAddress,
    );
  }

  async getBetByTransactionHash(
    transactionHash: string,
  ): Promise<Bet | undefined> {
    return Array.from(this.bets.values()).find(
      (bet) => bet.transactionHash === transactionHash,
    );
  }

  async getBetByTaxTransactionHash(
    taxTransactionHash: string,
  ): Promise<Bet | undefined> {
    return Array.from(this.bets.values()).find(
      (bet) => bet.taxTransactionHash === taxTransactionHash,
    );
  }

  async getRefundEligibleBets(): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.refundEligible && !bet.refundProcessed,
    );
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = randomUUID();
    const bet: Bet = {
      id,
      marketId: insertBet.marketId,
      userAddress: insertBet.userAddress,
      prediction: insertBet.prediction,
      amount: insertBet.amount,
      transactionHash: insertBet.transactionHash,
      taxTransactionHash: insertBet.taxTransactionHash ?? null,
      taxStatus: insertBet.taxStatus ?? "pending",
      chainId: insertBet.chainId,
      timestamp: new Date(),
      claimed: insertBet.claimed ?? false,
      claimTransactionHash: insertBet.claimTransactionHash ?? null,
      refundEligible: false,
      refundProcessed: false,
    };
    this.bets.set(id, bet);
    return bet;
  }

  async updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined> {
    const bet = this.bets.get(id);
    if (!bet) return undefined;

    const updatedBet = { ...bet, ...updates };
    this.bets.set(id, updatedBet);
    return updatedBet;
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByHash(
    transactionHash: string,
  ): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.transactionHash === transactionHash,
    );
  }

  async getTransactionsByUser(userAddress: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.userAddress === userAddress,
    );
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.type === type,
    );
  }

  async createTransaction(
    insertTransaction: InsertTransaction,
  ): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
      gasUsed: insertTransaction.gasUsed ?? null,
      metadata: insertTransaction.metadata ?? null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Platform Statistics
  async getPlatformStats(): Promise<{
    totalVolume: string;
    liveMarketsCount: number;
    activeUsersCount: number;
    totalPrizePool: string;
  }> {
    const allBets = Array.from(this.bets.values());
    const allMarkets = Array.from(this.predictionMarkets.values());

    const totalVolume = allBets.reduce((sum, bet) => {
      return sum + BigInt(bet.amount);
    }, BigInt(0));

    const liveMarketsCount = allMarkets.filter(
      (m) => m.status === "live" || m.status === "upcoming",
    ).length;

    const uniqueUsers = new Set(allBets.map((bet) => bet.userAddress));
    const activeUsersCount = uniqueUsers.size;

    const totalPrizePool = allMarkets
      .filter((m) => m.status === "live" || m.status === "upcoming")
      .reduce((sum, market) => {
        return sum + BigInt(market.totalPool || "0");
      }, BigInt(0));

    return {
      totalVolume: totalVolume.toString(),
      liveMarketsCount,
      activeUsersCount,
      totalPrizePool: totalPrizePool.toString(),
    };
  }
}

export const storage = new MemStorage();
