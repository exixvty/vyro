import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const project = process.cwd();
const schema = readFileSync(resolve(project, "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(project, "server/routers.ts"), "utf8");
const socialPage = readFileSync(resolve(project, "client/src/pages/Social.tsx"), "utf8");

describe("advanced workout sharing privacy", () => {
  it("persists an explicit audience and owner-only notes on every activity post", () => {
    expect(schema).toContain('audience: mysqlEnum("audience", ["public", "friends", "private"])');
    expect(schema).toContain('privateNotes: text("privateNotes")');
    expect(router).toContain("privateNotes: sql<string | null>`CASE WHEN");
    expect(router).toContain("canViewActivity(");
    expect(router).toContain('eq(activityFeed.audience, "public")');
    expect(router).toContain('eq(activityFeed.audience, "friends")');
  });

  it("limits friends-only visibility to accepted relationships and protects likes with the same rule", () => {
    expect(router).toContain("getAcceptedFriendIds");
    expect(router).toContain('eq(friendships.status, "accepted")');
    expect(router).toContain("if (!canViewActivity(post, ctx.user.id, friendIds))");
    expect(router).toContain('message: "This post is private"');
  });

  it("offers only achievements and personal records eligible for the chosen workout", () => {
    expect(router).toContain("getShareOptions: protectedProcedure");
    expect(router).toContain("gte(achievements.earnedAt, session.completedAt)");
    expect(router).toContain("gte(personalRecords.recordDate, sessionDay)");
    expect(router).toContain("Only achievements and PRs eligible for this workout can be shared");
  });

  it("exposes workout history, reflections, private notes, difficulty, showcases, and audiences in the composer", () => {
    expect(socialPage).toContain("Choose from workout history");
    expect(socialPage).toContain("How did it go?");
    expect(socialPage).toContain("Private notes");
    expect(socialPage).toContain("Showcase achievements & PRs");
    expect(socialPage).toContain("Who can see this?");
    expect(socialPage).toContain("Share with friends");
    expect(socialPage).toContain("Save privately");
  });
});
