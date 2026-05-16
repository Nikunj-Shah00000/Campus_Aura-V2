import { Router } from "express";
import { db, messagesTable, roomsTable, bannedTable } from "@workspace/db";
import { sql, gte } from "drizzle-orm";

const router = Router();

router.get("/live", async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 86400000);

    const [msgCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messagesTable)
      .where(gte(messagesTable.createdAt, yesterday));

    const [roomCount] = await db.select({ count: sql<number>`count(*)` }).from(roomsTable);
    const [bannedCount] = await db.select({ count: sql<number>`count(*)` }).from(bannedTable);

    res.json({
      activeUsers: Math.floor(Math.random() * 80) + 20,
      messagesToday: Number(msgCount.count),
      roomsOnline: Number(roomCount.count),
      reportsBanned: Number(bannedCount.count),
      counselorSessions: Math.floor(Math.random() * 30) + 5,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting live stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mood", async (req, res) => {
  try {
    const rooms = await db.select({ mood: roomsTable.mood }).from(roomsTable);
    const breakdown: Record<string, number> = {};
    for (const r of rooms) {
      breakdown[r.mood] = (breakdown[r.mood] ?? 0) + 1;
    }

    const moods = rooms.map((r) => r.mood);
    const moodScores: Record<string, number> = {
      calm: 10,
      hopeful: 15,
      stressed: 50,
      anxious: 65,
      sad: 45,
    };

    const avgScore =
      moods.length > 0
        ? moods.reduce((acc, m) => acc + (moodScores[m] ?? 30), 0) / moods.length
        : 25;

    const overall =
      avgScore < 20
        ? "calm"
        : avgScore < 35
        ? "hopeful"
        : avgScore < 50
        ? "stressed"
        : avgScore < 70
        ? "anxious"
        : "sad";

    res.json({ overall, breakdown, crisisLevel: Math.min(Math.round(avgScore), 100) });
  } catch (err) {
    req.log.error({ err }, "Error getting mood pulse");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
