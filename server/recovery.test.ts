import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

// User created today — within 21-day trial window
const trialUserCtx = {
  user: {
    id: 1,
    openId: "trial-open-id",
    name: "Trial User",
    email: "trial@example.com",
    avatar: null,
    role: "user" as const,
    createdAt: new Date(), // just created — in trial
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "oauth",
  },
};

// User created 30 days ago — trial expired, not paid
const expiredTrialCtx = {
  user: {
    id: 2,
    openId: "expired-open-id",
    name: "Expired User",
    email: "expired@example.com",
    avatar: null,
    role: "user" as const,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "oauth",
  },
};

const trialCaller = appRouter.createCaller(trialUserCtx as any);
const expiredCaller = appRouter.createCaller(expiredTrialCtx as any);

describe("Recovery Router — 21-Day Trial Logic", () => {
  it("checkPremium returns isPremium=true for user within 21-day trial", async () => {
    const result = await trialCaller.recovery.checkPremium();
    expect(result.isPremium).toBe(true);
    expect(result.isInTrial).toBe(true);
    expect(result.trialDaysLeft).toBeGreaterThan(0);
    expect(result.trialDaysLeft).toBeLessThanOrEqual(21);
  });

  it("checkPremium returns isPremium=false for user after trial expires (no paid plan)", async () => {
    const result = await expiredCaller.recovery.checkPremium();
    expect(result.isPremium).toBe(false);
    expect(result.isInTrial).toBe(false);
    expect(result.trialDaysLeft).toBe(0);
  });

  it("listAddictions returns an array for trial user", async () => {
    const result = await trialCaller.recovery.listAddictions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("listMotivations returns an array for trial user", async () => {
    const result = await trialCaller.recovery.listMotivations();
    expect(Array.isArray(result)).toBe(true);
  });

  it("listAddictions throws FORBIDDEN for expired trial user", async () => {
    await expect(expiredCaller.recovery.listAddictions()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("listMotivations throws FORBIDDEN for expired trial user", async () => {
    await expect(expiredCaller.recovery.listMotivations()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
