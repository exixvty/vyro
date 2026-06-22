import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userAddictions, urgeLog, recoveryMotivations, userProfiles, notificationSettings } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/* ─── Premium Guard ──────────────────────────────────────────────────────── */
const TRIAL_DAYS = 21;

async function requirePremium(userId: number, userCreatedAt?: Date) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  const now = new Date();

  // 21-day free trial based on account creation date
  if (userCreatedAt) {
    const trialEnd = new Date(userCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    if (now < trialEnd) return db; // still in trial — allow access
  }

  const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const profile = profiles[0];
  const isPaidPremium = profile?.isPremium && (!profile.premiumExpiresAt || profile.premiumExpiresAt > now);
  if (!isPaidPremium) throw new TRPCError({ code: "FORBIDDEN", message: "Premium required" });
  return db;
}

export const recoveryRouter = router({
  /* ─── Get all active addictions for user ─── */
  listAddictions: protectedProcedure.query(async ({ ctx }) => {
    const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
    return db
      .select()
      .from(userAddictions)
      .where(and(eq(userAddictions.userId, ctx.user.id), eq(userAddictions.isActive, true)))
      .orderBy(desc(userAddictions.createdAt));
  }),

  /* ─── Add a new addiction to track ─── */
  addAddiction: protectedProcedure
    .input(z.object({
      addictionType: z.string().min(1).max(100),
      addictionLabel: z.string().min(1).max(150),
      sobrietyStartDate: z.date(),
      notes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      const [result] = await db.insert(userAddictions).values({
        userId: ctx.user.id,
        addictionType: input.addictionType,
        addictionLabel: input.addictionLabel,
        sobrietyStartDate: input.sobrietyStartDate,
        notes: input.notes ?? null,
        isActive: true,
      });
      return { id: result.insertId };
    }),

  /* ─── Update sobriety start date (relapse reset) ─── */
  resetSobriety: protectedProcedure
    .input(z.object({
      addictionId: z.number(),
      newStartDate: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      await db
        .update(userAddictions)
        .set({ sobrietyStartDate: input.newStartDate })
        .where(and(eq(userAddictions.id, input.addictionId), eq(userAddictions.userId, ctx.user.id)));
      return { success: true };
    }),

  /* ─── Delete / deactivate an addiction ─── */
  removeAddiction: protectedProcedure
    .input(z.object({ addictionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      await db
        .update(userAddictions)
        .set({ isActive: false })
        .where(and(eq(userAddictions.id, input.addictionId), eq(userAddictions.userId, ctx.user.id)));
      return { success: true };
    }),

  /* ─── Log an urge ─── */
  logUrge: protectedProcedure
    .input(z.object({
      addictionId: z.number(),
      intensity: z.number().min(1).max(10),
      trigger: z.string().max(200).optional(),
      copingStrategy: z.string().max(200).optional(),
      overcame: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      const [result] = await db.insert(urgeLog).values({
        userId: ctx.user.id,
        addictionId: input.addictionId,
        intensity: input.intensity,
        trigger: input.trigger ?? null,
        copingStrategy: input.copingStrategy ?? null,
        overcame: input.overcame,
      });
      return { id: result.insertId };
    }),

  /* ─── Get urge history for an addiction ─── */
  getUrgeHistory: protectedProcedure
    .input(z.object({ addictionId: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      return db
        .select()
        .from(urgeLog)
        .where(and(eq(urgeLog.userId, ctx.user.id), eq(urgeLog.addictionId, input.addictionId)))
        .orderBy(desc(urgeLog.loggedAt))
        .limit(input.limit);
    }),

  /* ─── Custom motivations ─── */
  listMotivations: protectedProcedure.query(async ({ ctx }) => {
    const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
    return db
      .select()
      .from(recoveryMotivations)
      .where(and(eq(recoveryMotivations.userId, ctx.user.id), eq(recoveryMotivations.isActive, true)))
      .orderBy(desc(recoveryMotivations.createdAt));
  }),

  addMotivation: protectedProcedure
    .input(z.object({ message: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      const [result] = await db.insert(recoveryMotivations).values({
        userId: ctx.user.id,
        message: input.message,
        isActive: true,
      });
      return { id: result.insertId };
    }),

  deleteMotivation: protectedProcedure
    .input(z.object({ motivationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      await db
        .update(recoveryMotivations)
        .set({ isActive: false })
        .where(and(eq(recoveryMotivations.id, input.motivationId), eq(recoveryMotivations.userId, ctx.user.id)));
      return { success: true };
    }),

  /* ─── Log craving alert (sends immediate push) ─── */
  logCravingAlert: protectedProcedure
    .input(z.object({
      addictionId: z.number(),
      message: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      // Log the craving in urge log
      const [result] = await db.insert(urgeLog).values({
        userId: ctx.user.id,
        addictionId: input.addictionId,
        intensity: 8, // high intensity for craving alert
        trigger: input.message ?? "User triggered craving alert",
        copingStrategy: null,
        overcame: false,
      });
      // Send immediate push notification
      const { sendPushToUser } = await import("./notifications");
      await sendPushToUser(ctx.user.id, {
        title: "You've Got This! 💪",
        body: "A craving hit you, but you're stronger. Log it, breathe, and move forward.",
        tag: "craving-alert",
        data: {
          url: "/recovery",
          type: "craving_alert",
        },
      });
      return { id: result.insertId, notificationSent: true };
    }),

  /* ─── Set sobriety reminder time ─── */
  setSobrietyReminderTime: protectedProcedure
    .input(z.object({
      time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
      enabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
      const settings = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, ctx.user.id))
        .limit(1);
      if (!settings[0]) {
        // Create default settings if not exists
        await db.insert(notificationSettings).values({
          userId: ctx.user.id,
          sobrietyReminderTime: input.time,
          sobrietyReminder: input.enabled ?? true,
        });
      } else {
        await db
          .update(notificationSettings)
          .set({
            sobrietyReminderTime: input.time,
            sobrietyReminder: input.enabled ?? settings[0].sobrietyReminder,
          })
          .where(eq(notificationSettings.userId, ctx.user.id));
      }
      return { success: true };
    }),

  /* ─── Get sobriety reminder settings ─── */
  getSobrietyReminderSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await requirePremium(ctx.user.id, ctx.user.createdAt);
    const settings = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, ctx.user.id))
      .limit(1);
    if (!settings[0]) {
      return { sobrietyReminder: true, sobrietyReminderTime: "09:00", cravingAlertEnabled: true };
    }
    return {
      sobrietyReminder: settings[0].sobrietyReminder,
      sobrietyReminderTime: settings[0].sobrietyReminderTime,
      cravingAlertEnabled: settings[0].cravingAlertEnabled,
    };
  }),

  /* ─── Check premium status ─── */
  checkPremium: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const now = new Date();
    // 21-day free trial based on account creation date
    const accountCreatedAt = ctx.user.createdAt;
    const trialEndDate = new Date(accountCreatedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const isInTrial = now < trialEndDate;
    const trialDaysLeft = isInTrial
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    if (!db) return { isPremium: isInTrial, trialDaysLeft, isInTrial, isPaidPremium: false };

    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    const profile = profiles[0];
    const isPaidPremium = !!(profile?.isPremium && (!profile.premiumExpiresAt || profile.premiumExpiresAt > now));
    const isPremium = isPaidPremium || isInTrial;
    return { isPremium, trialDaysLeft, isInTrial, isPaidPremium };
  }),
});
