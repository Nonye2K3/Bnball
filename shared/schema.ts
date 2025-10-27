import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const predictionMarkets = pgTable("prediction_markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("live"),
  startTime: timestamp("start_time").notNull(),
  deadline: timestamp("deadline").notNull(),
  resolutionMethod: text("resolution_method").notNull(),
  totalPool: decimal("total_pool", { precision: 18, scale: 8 }).notNull().default("0"),
  yesOdds: decimal("yes_odds", { precision: 5, scale: 2 }).notNull().default("50"),
  noOdds: decimal("no_odds", { precision: 5, scale: 2 }).notNull().default("50"),
  participants: integer("participants").notNull().default(0),
  result: text("result"),
  resolutionData: text("resolution_data"),
  contractMarketId: integer("contract_market_id"),
  transactionHash: text("transaction_hash"),
  chainId: integer("chain_id"),
  creatorAddress: text("creator_address"),
  yesPoolOnChain: decimal("yes_pool_on_chain", { precision: 18, scale: 8 }),
  noPoolOnChain: decimal("no_pool_on_chain", { precision: 18, scale: 8 }),
  resolvedTransactionHash: text("resolved_transaction_hash"),
  resolvedAt: timestamp("resolved_at"),
}, (table) => ({
  chainIdIdx: index("prediction_markets_chain_id_idx").on(table.chainId),
  transactionHashIdx: index("prediction_markets_transaction_hash_idx").on(table.transactionHash),
  creatorAddressIdx: index("prediction_markets_creator_address_idx").on(table.creatorAddress),
}));

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  marketId: varchar("market_id").notNull().references(() => predictionMarkets.id),
  userAddress: text("user_address").notNull(),
  prediction: text("prediction").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  chainId: integer("chain_id").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  claimed: boolean("claimed").notNull().default(false),
  claimTransactionHash: text("claim_transaction_hash"),
}, (table) => ({
  userAddressIdx: index("bets_user_address_idx").on(table.userAddress),
  marketIdIdx: index("bets_market_id_idx").on(table.marketId),
  transactionHashIdx: index("bets_transaction_hash_idx").on(table.transactionHash),
  chainIdIdx: index("bets_chain_id_idx").on(table.chainId),
}));

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull(),
  type: text("type").notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  status: text("status").notNull(),
  chainId: integer("chain_id").notNull(),
  value: decimal("value", { precision: 18, scale: 8 }).notNull(),
  gasUsed: decimal("gas_used", { precision: 18, scale: 8 }),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  metadata: text("metadata"),
}, (table) => ({
  userAddressIdx: index("transactions_user_address_idx").on(table.userAddress),
  transactionHashIdx: uniqueIndex("transactions_transaction_hash_idx").on(table.transactionHash),
  chainIdIdx: index("transactions_chain_id_idx").on(table.chainId),
  typeIdx: index("transactions_type_idx").on(table.type),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPredictionMarketSchema = createInsertSchema(predictionMarkets).omit({
  id: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  timestamp: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PredictionMarket = typeof predictionMarkets.$inferSelect;
export type InsertPredictionMarket = z.infer<typeof insertPredictionMarketSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
