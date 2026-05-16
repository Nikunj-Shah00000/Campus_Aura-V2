import { Router } from "express";
import { db, counselorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ConnectCounselorBody } from "@workspace/api-zod";

const router = Router();

const TOPIC_MAP: Record<string, string[]> = {
  anxiety: ["anxiety", "stress", "panic"],
  depression: ["depression", "mood", "grief"],
  bullying: ["bullying", "harassment", "trauma"],
  stress: ["stress", "anxiety", "burnout"],
  loneliness: ["loneliness", "isolation", "connection"],
  relationship: ["relationship", "family", "communication"],
  other: [],
};

router.get("/", async (req, res) => {
  try {
    const { topic } = req.query as { topic?: string };
    const counselors = await db.select().from(counselorsTable);
    let result = counselors;

    if (topic && TOPIC_MAP[topic]) {
      const keywords = TOPIC_MAP[topic];
      result = counselors.filter((c) =>
        keywords.length === 0
          ? true
          : c.specialization.some((s: string) =>
              keywords.some((k) => s.toLowerCase().includes(k))
            )
      );
      if (result.length === 0) result = counselors;
    }

    res.json(
      result.map((c) => ({
        id: c.id,
        name: c.name,
        specialization: c.specialization,
        tagline: c.tagline ?? null,
        available: c.available,
        avatarColor: c.avatarColor,
        rating: c.rating,
        sessionCount: c.sessionCount,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing counselors");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/connect", async (req, res) => {
  try {
    const parse = ConnectCounselorBody.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }

    const { problemType, urgency } = parse.data;
    const keywords = TOPIC_MAP[problemType] ?? [];

    const counselors = await db
      .select()
      .from(counselorsTable)
      .where(eq(counselorsTable.available, true));

    let matched = counselors.filter((c) =>
      keywords.length === 0
        ? true
        : c.specialization.some((s: string) =>
            keywords.some((k) => s.toLowerCase().includes(k))
          )
    );

    if (matched.length === 0) matched = counselors;
    if (matched.length === 0) {
      res.status(503).json({ error: "No counselors available" });
      return;
    }

    matched.sort((a, b) => b.rating - a.rating);
    const counselor = matched[0];

    const waitMap: Record<string, number> = {
      crisis: 1,
      high: 3,
      medium: 8,
      low: 15,
    };

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db
      .update(counselorsTable)
      .set({ sessionCount: counselor.sessionCount + 1 })
      .where(eq(counselorsTable.id, counselor.id));

    res.json({
      counselor: {
        id: counselor.id,
        name: counselor.name,
        specialization: counselor.specialization,
        tagline: counselor.tagline ?? null,
        available: counselor.available,
        avatarColor: counselor.avatarColor,
        rating: counselor.rating,
        sessionCount: counselor.sessionCount + 1,
      },
      sessionId,
      estimatedWait: waitMap[urgency ?? "medium"] ?? 8,
      message: `${counselor.name} is ready to support you. You are not alone.`,
    });
  } catch (err) {
    req.log.error({ err }, "Error connecting counselor");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
