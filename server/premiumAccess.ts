import { eq } from "drizzle-orm";
import type { getDb } from "./db";
import { userProfiles, type UserProfile } from "../drizzle/schema";

export const TRIAL_DURATION_DAYS = 21;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type PremiumProfile = Pick<
  UserProfile,
  "isPremium" | "premiumExpiresAt" | "trialStartedAt" | "trialExpiresAt"
>;

export function getTrialEndDate(startedAt: Date) {
  return new Date(startedAt.getTime() + TRIAL_DURATION_DAYS * DAY_IN_MS);
}

export function calculatePremiumAccess(profile: PremiumProfile | null | undefined, now = new Date()) {
  const trialStartedAt = profile?.trialStartedAt ?? null;
  const trialExpiresAt = profile?.trialExpiresAt ?? (trialStartedAt ? getTrialEndDate(trialStartedAt) : null);
  const isInTrial = Boolean(trialExpiresAt && now < trialExpiresAt);
  const isPaidPremium = Boolean(
    profile?.isPremium && (!profile.premiumExpiresAt || profile.premiumExpiresAt > now)
  );

  return {
    isPremium: isPaidPremium || isInTrial,
    isInTrial,
    isPaidPremium,
    hasUsedTrial: Boolean(trialStartedAt),
    trialDaysLeft: isInTrial && trialExpiresAt
      ? Math.max(1, Math.ceil((trialExpiresAt.getTime() - now.getTime()) / DAY_IN_MS))
      : 0,
    trialStartedAt,
    trialExpiresAt,
  };
}

export async function getPremiumAccess(db: Database | null | undefined, userId: number, now = new Date()) {
  if (!db) return { profile: null, ...calculatePremiumAccess(null, now) };

  const profiles = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const profile = profiles[0] ?? null;

  return { profile, ...calculatePremiumAccess(profile, now) };
}
