import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { pushSubscriptions, notificationSettings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import webpush from "web-push";

// ── VAPID setup ───────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@vyrofit.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// ── Helper: send push to all user subscriptions ───────────────────────────────
export async function sendPushToUser(
  userId: number,
  payload: { title: string; body: string; icon?: string; badge?: string; tag?: string; data?: Record<string, unknown> }
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const db = await getDb();
  if (!db) return;

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  const payloadStr = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon ?? "/icon-192.png",
    badge: payload.badge ?? "/icon-192.png",
    tag: payload.tag ?? "vyro-notification",
    data: payload.data ?? {},
  });

  const results = await Promise.allSettled(
    subs.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payloadStr
      )
    )
  );

  // Remove expired/invalid subscriptions
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db
          .delete(pushSubscriptions)
          .where(
            and(
              eq(pushSubscriptions.userId, userId),
              eq(pushSubscriptions.endpoint, subs[i].endpoint)
            )
          );
      }
    }
  }
}

// ── Router ────────────────────────────────────────────────────────────────────
export const notificationsRouter = router({
  // Get VAPID public key for client subscription
  getVapidKey: protectedProcedure.query(() => {
    return { publicKey: VAPID_PUBLIC_KEY };
  }),

  // Subscribe to push notifications
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if this endpoint already exists
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      const alreadyExists = existing.find(
        (s: { endpoint: string }) => s.endpoint === input.endpoint
      );
      if (alreadyExists) {
        return { success: true, message: "Already subscribed" };
      }

      await db.insert(pushSubscriptions).values({
        userId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent,
      });

      // Send a welcome notification
      await sendPushToUser(userId, {
        title: "🔥 VYRO Notifications Active!",
        body: "You'll get daily reminders to stay on track. Let's get after it!",
        tag: "welcome",
      });

      return { success: true };
    }),

  // Unsubscribe from push notifications
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.endpoint)
          )
        );
      return { success: true };
    }),

  // Check subscription status
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { isSubscribed: false, count: 0 };
    const subs = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, ctx.user.id));
    return { isSubscribed: subs.length > 0, count: subs.length };
  }),

  // Get notification settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        workoutReminder: true, workoutReminderTime: "09:00",
        habitReminder: true, habitReminderTime: "20:00",
        streakAlert: true, levelUpAlert: true, achievementAlert: true, weeklySummary: true,
      };
    }
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, ctx.user.id));

    if (!settings) {
      return {
        workoutReminder: true, workoutReminderTime: "09:00",
        habitReminder: true, habitReminderTime: "20:00",
        streakAlert: true, levelUpAlert: true, achievementAlert: true, weeklySummary: true,
      };
    }
    return settings;
  }),

  // Update notification settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        workoutReminder: z.boolean().optional(),
        workoutReminderTime: z.string().optional(),
        habitReminder: z.boolean().optional(),
        habitReminderTime: z.string().optional(),
        streakAlert: z.boolean().optional(),
        levelUpAlert: z.boolean().optional(),
        achievementAlert: z.boolean().optional(),
        weeklySummary: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [existing] = await db
        .select({ id: notificationSettings.id })
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, userId));

      if (existing) {
        await db
          .update(notificationSettings)
          .set(input)
          .where(eq(notificationSettings.userId, userId));
      } else {
        await db.insert(notificationSettings).values({ userId, ...input });
      }
      return { success: true };
    }),

  // Send test notification
  sendTest: protectedProcedure.mutation(async ({ ctx }) => {
    await sendPushToUser(ctx.user.id, {
      title: "⚡ Test Notification",
      body: "VYRO notifications are working! Time to crush your goals 🔥",
      tag: "test",
    });
    return { success: true };
  }),
});
