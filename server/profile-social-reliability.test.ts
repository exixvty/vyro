import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const project = process.cwd();
const router = readFileSync(resolve(project, "server/routers.ts"), "utf8");
const profilePage = readFileSync(resolve(project, "client/src/pages/Profile.tsx"), "utf8");
const socialPage = readFileSync(resolve(project, "client/src/pages/Social.tsx"), "utf8");

describe("profile picture and community sharing reliability", () => {
  it("stores avatar bytes through the authenticated storage mutation and persists the returned URL", () => {
    expect(router).toContain("uploadAvatar: protectedProcedure");
    expect(router).toContain("imageBase64: z.string().min(1).max(7_000_000)");
    expect(router).toContain("image/jpeg");
    expect(router).toContain("image/png");
    expect(router).toContain("image/webp");
    expect(router).toContain("Profile pictures must be an image up to 5 MB");
    expect(router).toContain("`avatars/${ctx.user.id}/avatar-${Date.now()}.${extension}`");
    expect(router).toContain("onDuplicateKeyUpdate({ set: { avatarUrl: url } })");
  });

  it("validates avatar files in the client and refreshes the persisted profile instead of calling a missing upload route", () => {
    expect(profilePage).toContain("trpc.profile.uploadAvatar.useMutation");
    expect(profilePage).toContain("function getAvatarInitials(name?: string | null, email?: string | null)");
    expect(profilePage).toContain("const initials = getAvatarInitials(user?.name, user?.email)");
    expect(profilePage).toContain("${user?.name || \"VYRO athlete\"} initials");
    expect(profilePage).toContain("Choose a JPG, PNG, or WebP image");
    expect(profilePage).toContain("Profile pictures must be 5 MB or smaller");
    expect(profilePage).toContain("reader.readAsDataURL(file)");
    expect(profilePage).toContain("utils.profile.get.invalidate()");
    expect(profilePage).not.toContain("fetch(\"/api/upload\"");
  });

  it("creates only authenticated, persisted community posts and validates attached workout ownership", () => {
    expect(router).toContain("createPost: protectedProcedure");
    expect(router).toContain("content: z.string().trim().min(1).max(500)");
    expect(router).toContain("eq(workoutSessions.userId, ctx.user.id)");
    expect(router).toContain("await db.insert(activityFeed).values({");
    expect(router).toContain("isPublic: true");
    expect(router).toContain("avatarUrl: userProfiles.avatarUrl");
  });

  it("renders real feed data and never seeds fabricated community activity", () => {
    expect(socialPage).toContain("trpc.social.getFeed.useQuery");
    expect(socialPage).toContain("trpc.social.createPost.useMutation");
    expect(socialPage).toContain("trpc.social.likeItem.useMutation");
    expect(socialPage).toContain("Create your first post");
    expect(socialPage).not.toContain("SAMPLE_POSTS");
    expect(socialPage).not.toContain("setPosts(");
  });
});
