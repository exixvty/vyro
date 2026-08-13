import type { getDb } from "./db";
import { userProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const TRIAL_DAYS = 21;
export const TRIAL_DURATION_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export function getTrialEndDate(startedAt: Date): Date {
  return new Date(startedAt.getTime() + TRIAL_DURATION_MS);
}

export async function getPremiumAccess(db: Database, userId: number, accountCreatedAt: Date) {
  const now = new Date();
  const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const profile = profiles[0] ?? null;
  const isPaidPremium = Boolean(profile?.isPremium && (!profile.premiumExpiresAt || profile.premiumExpiresAt > now));

  // Existing accounts retain the original automatic 21-day trial until they explicitly start one.
  const automaticTrialEnd = getTrialEndDate(accountCreatedAt);
  const trialExpiresAt = profile?.trialExpiresAt ?? (!profile?.trialStartedAt ? automaticTrialEnd : null);
  const isInTrial = Boolean(trialExpiresAt && trialExpiresAt > now);
  const trialDaysLeft = isInTrial && trialExpiresAt
    ? Math.max(1, Math.ceil((trialExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  return {
    profile,
    isPremium: isPaidPremium || isInTrial,
    isPaidPremium,
    isInTrial,
    trialDaysLeft,
    trialExpiresAt,
  };
}
