import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { themePreferences } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const themeRouter = router({
  // Get user's theme preferences
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(themePreferences)
      .where(eq(themePreferences.userId, ctx.user.id))
      .limit(1);

    return result[0] ?? null;
  }),

  // Upsert theme preferences
  upsert: protectedProcedure
    .input(
      z.object({
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        buttonStyle: z.enum(["solid", "outline", "gradient", "glassmorphism"]).optional(),
        fontFamily: z.enum(["inter", "space-grotesk", "syne", "poppins", "roboto"]).optional(),
        appName: z.string().optional(),
        logoUrl: z.string().optional(),
        presetTheme: z.enum(["custom", "neon", "sunset", "ocean", "forest", "cyberpunk"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if preferences exist
      const existing = await db
        .select()
        .from(themePreferences)
        .where(eq(themePreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        // Update
        const updated = await db
          .update(themePreferences)
          .set({
            primaryColor: input.primaryColor ?? existing[0].primaryColor,
            accentColor: input.accentColor ?? existing[0].accentColor,
            secondaryColor: input.secondaryColor ?? existing[0].secondaryColor,
            buttonStyle: input.buttonStyle ?? existing[0].buttonStyle,
            fontFamily: input.fontFamily ?? existing[0].fontFamily,
            appName: input.appName ?? existing[0].appName,
            logoUrl: input.logoUrl ?? existing[0].logoUrl,
            presetTheme: input.presetTheme ?? existing[0].presetTheme,
            updatedAt: new Date(),
          })
          .where(eq(themePreferences.userId, ctx.user.id));

        return { success: true, message: "Theme preferences updated" };
      } else {
        // Create
        await db.insert(themePreferences).values({
          userId: ctx.user.id,
          primaryColor: input.primaryColor ?? "violet",
          accentColor: input.accentColor ?? "cyan",
          secondaryColor: input.secondaryColor ?? "pink",
          buttonStyle: input.buttonStyle ?? "solid",
          fontFamily: input.fontFamily ?? "inter",
          appName: input.appName ?? "VYRO",
          logoUrl: input.logoUrl,
          presetTheme: input.presetTheme ?? "custom",
        });

        return { success: true, message: "Theme preferences created" };
      }
    }),

  // Apply a preset theme
  applyPreset: protectedProcedure
    .input(z.enum(["neon", "sunset", "ocean", "forest", "cyberpunk"]))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const presets: Record<string, any> = {
        neon: {
          primaryColor: "cyan",
          accentColor: "magenta",
          secondaryColor: "lime",
          presetTheme: "neon",
        },
        sunset: {
          primaryColor: "orange",
          accentColor: "pink",
          secondaryColor: "red",
          presetTheme: "sunset",
        },
        ocean: {
          primaryColor: "blue",
          accentColor: "cyan",
          secondaryColor: "teal",
          presetTheme: "ocean",
        },
        forest: {
          primaryColor: "green",
          accentColor: "lime",
          secondaryColor: "teal",
          presetTheme: "forest",
        },
        cyberpunk: {
          primaryColor: "violet",
          accentColor: "cyan",
          secondaryColor: "magenta",
          presetTheme: "cyberpunk",
        },
      };

      const preset = presets[input];
      const existing = await db
        .select()
        .from(themePreferences)
        .where(eq(themePreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(themePreferences)
          .set({
            ...preset,
            updatedAt: new Date(),
          })
          .where(eq(themePreferences.userId, ctx.user.id));
      } else {
        await db.insert(themePreferences).values({
          userId: ctx.user.id,
          ...preset,
        });
      }

      return { success: true, message: `Preset theme "${input}" applied` };
    }),
});
