import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const project = process.cwd();
const appSource = readFileSync(resolve(project, "client/src/App.tsx"), "utf8");
const routerSource = readFileSync(resolve(project, "server/routers.ts"), "utf8");

const programmes = [
  { name: "Onboarding", route: "/onboarding", page: "Onboarding.tsx", api: "profile" },
  { name: "Workout", route: "/workout", page: "Workout.tsx", api: "workout" },
  { name: "Nutrition", route: "/nutrition", page: "Nutrition.tsx", api: "nutrition" },
  { name: "Progress", route: "/progress", page: "Progress.tsx", api: "progress" },
  { name: "Habits", route: "/habits", page: "Habits.tsx", api: "habits" },
  { name: "Exercise library", route: "/library", page: "Library.tsx", api: "exercises" },
  { name: "Gamification", route: "/gamification", page: "Gamification.tsx", api: "gamification" },
  { name: "Social", route: "/social", page: "Social.tsx", api: "social" },
  { name: "Profile", route: "/profile", page: "Profile.tsx", api: "profile" },
  { name: "Premium", route: "/premium", page: "Premium.tsx", api: "profile" },
  { name: "Referrals", route: "/referral", page: "Referral.tsx", api: "friends" },
  { name: "Friends", route: "/friends", page: "Friends.tsx", api: "friends" },
  { name: "Tiers", route: "/tiers", page: "Tiers.tsx", api: "gamification" },
  { name: "Performance", route: "/performance", page: "Performance.tsx", api: "workout" },
  { name: "Appearance", route: "/appearance", page: "Appearance.tsx", api: "theme" },
  { name: "Notifications", route: "/notifications", page: "Notifications.tsx", api: "notifications" },
  { name: "Recovery", route: "/recovery", page: "Recovery.tsx", api: "recovery" },
];

describe("major programme smoke audit", () => {
  it.each(programmes)("exposes the $name programme route, page, and server module", ({ route, page, api }) => {
    expect(appSource).toContain(`path="${route}"`);
    expect(existsSync(resolve(project, "client/src/pages", page))).toBe(true);
    expect(routerSource).toContain(`${api}:`);
  });

  it("keeps primary workout controls reachable from the active session", () => {
    const workoutSource = readFileSync(resolve(project, "client/src/pages/Workout.tsx"), "utf8");
    expect(workoutSource).toContain("Complete Workout");
    expect(workoutSource).toContain("Workout cancelled");
    expect(workoutSource).toContain("Add Exercise");
    expect(workoutSource).toContain("Add Set");
  });

  it("connects the Premium CTA to a persisted trial mutation", () => {
    const premiumSource = readFileSync(resolve(project, "client/src/pages/Premium.tsx"), "utf8");
    expect(premiumSource).toContain("trpc.profile.startTrial.useMutation");
    expect(premiumSource).toContain("startTrial.mutateAsync()");
    expect(routerSource).toContain("startTrial: protectedProcedure");
  });
});
