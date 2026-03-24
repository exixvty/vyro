import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      role: "user",
      email: null,
      loginMethod: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Notifications Router", () => {
  it("should return VAPID public key", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.notifications.getVapidKey();
    expect(typeof result.publicKey).toBe("string");
    // Key should be set (non-empty) from environment
    expect(result.publicKey.length).toBeGreaterThan(0);
  });

  it("should return default notification settings", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const settings = await caller.notifications.getSettings();
    expect(settings).toBeDefined();
    expect(typeof settings.workoutReminder).toBe("boolean");
    expect(typeof settings.habitReminder).toBe("boolean");
    expect(typeof settings.streakAlert).toBe("boolean");
    expect(typeof settings.levelUpAlert).toBe("boolean");
    expect(typeof settings.achievementAlert).toBe("boolean");
    expect(typeof settings.weeklySummary).toBe("boolean");
  });

  it("should return subscription status", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const status = await caller.notifications.getSubscriptionStatus();
    expect(status).toBeDefined();
    expect(typeof status.isSubscribed).toBe("boolean");
    expect(typeof status.count).toBe("number");
  });
});
