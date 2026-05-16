import { Router } from "express";
import { db, messagesTable, reportsTable, bannedTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ReportMessageBody } from "@workspace/api-zod";

const router = Router({ mergeParams: true });

const AUTO_BAN_REPORT_THRESHOLD = 3;

router.post("/:messageId/report", async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    if (isNaN(messageId)) {
      res.status(400).json({ error: "Invalid message id" });
      return;
    }

    const parse = ReportMessageBody.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }

    const { reason, reportedAnonId, details } = parse.data;

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, messageId))
      .limit(1);

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    await db.insert(reportsTable).values({
      messageId,
      reportedAnonId,
      reason,
      details: details ?? undefined,
      autoBanned: false,
    });

    await db
      .update(messagesTable)
      .set({
        reportCount: message.reportCount + 1,
        isFlagged: true,
      })
      .where(eq(messagesTable.id, messageId));

    const totalReports = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.reportedAnonId, reportedAnonId));

    let autoBanned = false;
    if (totalReports.length >= AUTO_BAN_REPORT_THRESHOLD) {
      const existing = await db
        .select()
        .from(bannedTable)
        .where(eq(bannedTable.anonId, reportedAnonId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(bannedTable).values({
          anonId: reportedAnonId,
          reason: `Auto-banned: ${totalReports.length} community reports (latest: ${reason})`,
        });
        autoBanned = true;

        await db
          .update(messagesTable)
          .set({ isBlocked: true, moderationReason: "Banned by community reports" })
          .where(eq(messagesTable.anonId, reportedAnonId));
      }
    }

    res.json({
      success: true,
      autoBanned,
      message: autoBanned
        ? "User has been automatically banned based on community reports."
        : "Report received. Our moderation team will review it.",
    });
  } catch (err) {
    req.log.error({ err }, "Error reporting message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
