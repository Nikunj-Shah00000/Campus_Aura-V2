import { Router } from "express";
import { db, roomsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rooms = await db.select().from(roomsTable).orderBy(desc(roomsTable.createdAt));
    const result = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      topic: r.topic,
      description: r.description ?? null,
      activeUsers: Math.floor(Math.random() * 40) + 5,
      messageCount: Math.floor(Math.random() * 200) + 10,
      mood: r.mood,
      isModerated: r.isModerated,
      createdAt: r.createdAt.toISOString(),
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing rooms");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
