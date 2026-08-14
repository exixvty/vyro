import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 999,
    openId: "test-vyro-user",
    email: "test@vyro.app",
    name: "Test Athlete",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("VYRO App Router", () => {
  it("has all required feature routers", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify all feature namespaces exist
    expect(caller.profile).toBeDefined();
    expect(caller.workout).toBeDefined();
    expect(caller.nutrition).toBeDefined();
    expect(caller.progress).toBeDefined();
    expect(caller.habits).toBeDefined();
    expect(caller.gamification).toBeDefined();
    expect(caller.social).toBeDefined();
    expect(caller.auth).toBeDefined();
    expect(caller.system).toBeDefined();
  });

  it("auth.me returns the authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me?.name).toBe("Test Athlete");
    expect(me?.email).toBe("test@vyro.app");
  });

  it("auth.logout returns success and clears cookie", async () => {
    const clearedCookies: string[] = [];
    const { ctx } = createAuthContext();
    ctx.res.clearCookie = (name: string) => { clearedCookies.push(name); };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });

  it("profile router has get, upsert, and avatar upload procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.profile.get).toBe("function");
    expect(typeof caller.profile.upsert).toBe("function");
    expect(typeof caller.profile.uploadAvatar).toBe("function");
  });

  it("workout router has all required procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.workout.generatePlan).toBe("function");
    expect(typeof caller.workout.quickWorkout).toBe("function");
    expect(typeof caller.workout.logSession).toBe("function");
    expect(typeof caller.workout.getSessions).toBe("function");
    expect(typeof caller.workout.getPlans).toBe("function");
  });

  it("nutrition router has all required procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.nutrition.logFood).toBe("function");
    expect(typeof caller.nutrition.getDayLogs).toBe("function");
    expect(typeof caller.nutrition.deleteLog).toBe("function");
    expect(typeof caller.nutrition.getGoals).toBe("function");
    expect(typeof caller.nutrition.setGoals).toBe("function");
    expect(typeof caller.nutrition.suggestMeal).toBe("function");
  });

  it("progress router has all required procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.progress.logEntry).toBe("function");
    expect(typeof caller.progress.getEntries).toBe("function");
    expect(typeof caller.progress.getRecords).toBe("function");
    expect(typeof caller.progress.setRecord).toBe("function");
  });

  it("habits router has all required procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.habits.create).toBe("function");
    expect(typeof caller.habits.list).toBe("function");
    expect(typeof caller.habits.complete).toBe("function");
    expect(typeof caller.habits.getCompletions).toBe("function");
    expect(typeof caller.habits.delete).toBe("function");
  });

  it("gamification router has all required procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.gamification.getStats).toBe("function");
    expect(typeof caller.gamification.getAchievements).toBe("function");
    expect(typeof caller.gamification.getLeaderboard).toBe("function");
  });

  it("social router has persisted feed, sharing, and engagement procedures", () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    expect(typeof caller.social.getFeed).toBe("function");
    expect(typeof caller.social.createPost).toBe("function");
    expect(typeof caller.social.likeItem).toBe("function");
    expect(typeof caller.social.getMyLikes).toBe("function");
  });
});
