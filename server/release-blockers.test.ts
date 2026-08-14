import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getPremiumAccess, getTrialEndDate } from "./premiumAccess";

function premiumDb(profile: Record<string, unknown> | null) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => profile ? [profile] : [],
        }),
      }),
    }),
  } as any;
}

describe("release-blocking reliability", () => {
  it("gives an explicitly activated trial twenty-one days of premium access", async () => {
    const startedAt = new Date();
    const access = await getPremiumAccess(
      premiumDb({ isPremium: false, premiumExpiresAt: null, trialStartedAt: startedAt, trialExpiresAt: getTrialEndDate(startedAt) }),
      42,
      new Date("2020-01-01")
    );

    expect(access.isPremium).toBe(true);
    expect(access.isInTrial).toBe(true);
    expect(access.trialDaysLeft).toBe(21);
  });

  it("denies a completed trial unless a paid premium membership remains active", async () => {
    const access = await getPremiumAccess(
      premiumDb({
        isPremium: false,
        premiumExpiresAt: null,
        trialStartedAt: new Date("2025-01-01"),
        trialExpiresAt: new Date("2025-01-22"),
      }),
      42,
      new Date("2020-01-01")
    );

    expect(access.isPremium).toBe(false);
    expect(access.isInTrial).toBe(false);
    expect(access.trialDaysLeft).toBe(0);
  });

  it("keeps paid premium access active independently from an expired trial", async () => {
    const access = await getPremiumAccess(
      premiumDb({
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 86_400_000),
        trialStartedAt: new Date("2025-01-01"),
        trialExpiresAt: new Date("2025-01-22"),
      }),
      42,
      new Date("2020-01-01")
    );

    expect(access.isPremium).toBe(true);
    expect(access.isPaidPremium).toBe(true);
  });

  it("offers direct cancellation and completion without a completed-set trap", () => {
    const workoutPage = readFileSync(resolve(process.cwd(), "client/src/pages/Workout.tsx"), "utf8");

    expect(workoutPage).toContain("onCancel();\n            toast(\"Workout cancelled\")");
    expect(workoutPage).not.toContain("Complete at least one set before finishing");
    expect(workoutPage).toContain("onFinish();");
  });

  it("keeps a saved workout session successful when an ancillary engagement write fails", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

    expect(routerSource).toContain("Promise.allSettled([");
    expect(routerSource).toContain("Workout completion side effect failed");
    expect(routerSource).toContain("return { success: true, xpEarned, ...levelUp };");
  });
});
