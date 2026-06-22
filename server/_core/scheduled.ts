import { Request, Response } from "express";
import { getDb } from "../db";
import { notificationSettings, userAddictions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendPushToUser } from "../routers/notifications";
import { sdk } from "./sdk";

/**
 * Daily sobriety reminder handler
 * Fires at 9am UTC daily and sends push notifications to users with sobriety reminders enabled
 */
export async function sendSobrietyRemindersHandler(req: Request, res: Response) {
  try {
    // Verify this is a cron request (check for cron task UID header)
    const taskUid = req.headers["x-manus-cron-task-uid"];
    if (!taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database unavailable" });
    }

    // Get all users with sobriety reminders enabled
    const settings = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.sobrietyReminder, true));

    let sentCount = 0;
    let errorCount = 0;

    for (const setting of settings) {
      try {
        // Get user's active addictions
        const addictions = await db
          .select()
          .from(userAddictions)
          .where(
            and(
              eq(userAddictions.userId, setting.userId),
              eq(userAddictions.isActive, true)
            )
          );

        if (addictions.length === 0) continue;

        // Calculate sobriety stats for the notification
        const now = new Date();
        const totalDays = addictions.reduce((sum, a) => {
          const start = new Date(a.sobrietyStartDate);
          const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        const avgDays = Math.floor(totalDays / addictions.length);

        // Send personalized push notification
        const addictionList = addictions.map((a) => a.addictionLabel).join(", ");
        await sendPushToUser(setting.userId, {
          title: "You're Stronger Every Day 💪",
          body: `${avgDays} days free from ${addictionList}. Keep going!`,
          tag: "sobriety-reminder",
          data: {
            url: "/recovery",
            type: "sobriety_reminder",
            avgDays,
            addictionCount: addictions.length,
          },
        });

        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder to user ${setting.userId}:`, err);
        errorCount++;
      }
    }

    res.json({
      ok: true,
      sentCount,
      errorCount,
      totalUsers: settings.length,
      taskUid,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Sobriety reminder handler error:", err);
    const error = err instanceof Error ? err : new Error(String(err));
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      context: { url: req.url, timestamp: new Date().toISOString() },
    });
  }
}
