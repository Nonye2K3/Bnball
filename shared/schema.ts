import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
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
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPredictionMarketSchema = createInsertSchema(predictionMarkets).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PredictionMarket = typeof predictionMarkets.$inferSelect;
export type InsertPredictionMarket = z.infer<typeof insertPredictionMarketSchema>;
