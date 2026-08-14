import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculatePremiumAccess, getTrialEndDate, TRIAL_DURATION_DAYS } from "./premiumAccess";

const DAY = 24 * 60 * 60 * 1000;

describe("durable free-trial access", () => {
  it("does not grant Premium solely because an account exists", () => {
    const access = calculatePremiumAccess({
      isPremium: false,
      premiumExpiresAt: null,
      trialStartedAt: null,
      trialExpiresAt: null,
    }, new Date("2026-08-14T12:00:00Z"));

    expect(access.isPremium).toBe(false);
    expect(access.isInTrial).toBe(false);
    expect(access.hasUsedTrial).toBe(false);
  });

  it("unlocks Premium for an explicitly activated trial and reports the remaining days", () => {
    const startedAt = new Date("2026-08-10T12:00:00Z");
    const access = calculatePremiumAccess({
      isPremium: false,
      premiumExpiresAt: null,
      trialStartedAt: startedAt,
      trialExpiresAt: getTrialEndDate(startedAt),
    }, new Date("2026-08-14T12:00:00Z"));

    expect(getTrialEndDate(startedAt).getTime() - startedAt.getTime()).toBe(TRIAL_DURATION_DAYS * DAY);
    expect(access.isPremium).toBe(true);
    expect(access.isInTrial).toBe(true);
    expect(access.hasUsedTrial).toBe(true);
    expect(access.trialDaysLeft).toBe(17);
  });

  it("does not restart an expired trial and still recognizes that it was used", () => {
    const startedAt = new Date("2026-07-01T12:00:00Z");
    const access = calculatePremiumAccess({
      isPremium: false,
      premiumExpiresAt: null,
      trialStartedAt: startedAt,
      trialExpiresAt: getTrialEndDate(startedAt),
    }, new Date("2026-08-14T12:00:00Z"));

    expect(access.isPremium).toBe(false);
    expect(access.isInTrial).toBe(false);
    expect(access.hasUsedTrial).toBe(true);
    expect(access.trialDaysLeft).toBe(0);
  });

  it("keeps paid VYRO Pro access independent from the free-trial lifecycle", () => {
    const access = calculatePremiumAccess({
      isPremium: true,
      premiumExpiresAt: new Date("2026-09-14T12:00:00Z"),
      trialStartedAt: null,
      trialExpiresAt: null,
    }, new Date("2026-08-14T12:00:00Z"));

    expect(access.isPremium).toBe(true);
    expect(access.isPaidPremium).toBe(true);
    expect(access.hasUsedTrial).toBe(false);
  });
});

describe("trial-status presentation and gates", () => {
  it("uses the persisted status mutation and suppresses the start button for an active or used trial", () => {
    const premiumPage = readFileSync(resolve(process.cwd(), "client/src/pages/Premium.tsx"), "utf8");

    expect(premiumPage).toContain("trpc.profile.getPremiumStatus.useQuery()");
    expect(premiumPage).toContain("trpc.profile.startTrial.useMutation()");
    expect(premiumPage).toContain("premiumStatus?.isPremium ? (");
    expect(premiumPage).toContain("premiumStatus?.hasUsedTrial");
    expect(premiumPage).toContain("VYRO Pro Trial Active");
  });

  it("uses one explicit-trial access helper for the API status and Recovery gate", () => {
    const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const recovery = readFileSync(resolve(process.cwd(), "server/routers/recovery.ts"), "utf8");

    expect(routers).toContain("startTrial: protectedProcedure.mutation");
    expect(routers).toContain("getPremiumStatus: protectedProcedure.query");
    expect(routers).toContain("currentProfile?.trialStartedAt");
    expect(recovery).toContain("import { getPremiumAccess } from \"../premiumAccess\"");
    expect(recovery).toContain("const access = await getPremiumAccess(db, ctx.user.id);");
  });
});
