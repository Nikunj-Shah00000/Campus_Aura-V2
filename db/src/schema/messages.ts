import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  anonId: text("anon_id").notNull(),
  content: text("content").notNull(),
  isBlocked: boolean("is_blocked").notNull().default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  reportCount: integer("report_count").notNull().default(0),
  moderationReason: text("moderation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
