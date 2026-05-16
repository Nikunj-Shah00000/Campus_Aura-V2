import { pgTable, text, serial, boolean, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const counselorsTable = pgTable("counselors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").array().notNull(),
  tagline: text("tagline"),
  available: boolean("available").notNull().default(true),
  avatarColor: text("avatar_color").notNull().default("#cc0022"),
  rating: real("rating").notNull().default(4.5),
  sessionCount: integer("session_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCounselorSchema = createInsertSchema(counselorsTable).omit({ id: true, createdAt: true });
export type InsertCounselor = z.infer<typeof insertCounselorSchema>;
export type Counselor = typeof counselorsTable.$inferSelect;
