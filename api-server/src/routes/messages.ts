import { Router } from "express";
import { db, messagesTable, bannedTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router({ mergeParams: true });

const BANNED_PATTERNS = [
  /\bnudes?\b/i,
  /\bporn\b/i,
  /\bsex\b/i,
  /\bfuck\b/i,
  /\bbitch\b/i,
  /\basshole\b/i,
  /\bshit\b/i,
  /\bcunt\b/i,
  /\bkys\b/i,
  /\bkill\s+yourself\b/i,
  /\bdrugs?\b/i,
  /\bweed\b/i,
  /\bcocaine\b/i,
  /\bheroin\b/i,
  /\bmeth\b/i,
  /\bwhore\b/i,
  /\bslut\b/i,
  /\bretard\b/i,
  /\bvandaliz/i,
];

const AUTO_BAN_THRESHOLD = 2;

function detectViolation(content: string): string | null {
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(content)) {
      const src = pattern.source;
      if (/nude|porn|sex/i.test(src)) return "nudity or explicit content";
      if (/drug|weed|cocaine|heroin|meth/i.test(src)) return "drug references";
      if (/kys|kill/i.test(src)) return "self-harm encouragement";
      if (/vandaliz/i.test(src)) return "vandalism";
      return "harsh or abusive language";
    }
  }
  return null;
}

router.get("/", async (req, res) => {
  try {
    const roomId = parseInt((req.params as Record<string, string>).roomId, 10);
    if (isNaN(roomId)) {
      res.status(400).json({ error: "Invalid room id" });
      return;
    }

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.roomId, roomId))
      .orderBy(messagesTable.createdAt)
      .limit(100);

    res.json(
      messages.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        anonId: m.anonId,
        content: m.isBlocked ? "[Message removed by moderation]" : m.content,
        createdAt: m.createdAt.toISOString(),
        isBlocked: m.isBlocked,
        isFlagged: m.isFlagged,
        reportCount: m.reportCount,
        moderationReason: m.moderationReason ?? null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error listing messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const roomId = parseInt((req.params as Record<string, string>).roomId, 10);
    if (isNaN(roomId)) {
      res.status(400).json({ error: "Invalid room id" });
      return;
    }

    const parse = SendMessageBody.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }

    const { content, anonId } = parse.data;

    const existing = await db
      .select()
      .from(bannedTable)
      .where(eq(bannedTable.anonId, anonId))
      .limit(1);

    if (existing.length > 0) {
      res.status(403).json({ error: "You are banned from this platform." });
      return;
    }

    const violation = detectViolation(content);
    const isBlocked = !!violation;

    const [message] = await db
      .insert(messagesTable)
      .values({
        roomId,
        anonId,
        content,
        isBlocked,
        isFlagged: isBlocked,
        reportCount: 0,
        moderationReason: violation ?? undefined,
      })
      .returning();

    let autoBanned = false;
    if (isBlocked) {
      const flaggedMessages = await db
        .select()
        .from(messagesTable)
        .where(and(eq(messagesTable.anonId, anonId), eq(messagesTable.isBlocked, true)));

      if (flaggedMessages.length >= AUTO_BAN_THRESHOLD) {
        await db
          .insert(bannedTable)
          .values({ anonId, reason: `Auto-banned: repeated violations (${violation})` })
          .onConflictDoNothing();
        autoBanned = true;
      }
    }

    res.status(201).json({
      message: {
        id: message.id,
        roomId: message.roomId,
        anonId: message.anonId,
        content: isBlocked ? "[Message removed by moderation]" : message.content,
        createdAt: message.createdAt.toISOString(),
        isBlocked: message.isBlocked,
        isFlagged: message.isFlagged,
        reportCount: message.reportCount,
        moderationReason: message.moderationReason ?? null,
      },
      wasFiltered: isBlocked,
      filterReason: violation ?? null,
      autoBanned,
    });
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
