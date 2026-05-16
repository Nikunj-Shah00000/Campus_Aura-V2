import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannedTable = pgTable("banned", {
  id: serial("id").primaryKey(),
  anonId: text("anon_id").notNull().unique(),
  reason: text("reason").notNull(),
  bannedAt: timestamp("banned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBannedSchema = createInsertSchema(bannedTable).omit({ id: true, bannedAt: true });
export type InsertBanned = z.infer<typeof insertBannedSchema>;
export type Banned = typeof bannedTable.$inferSelect;
