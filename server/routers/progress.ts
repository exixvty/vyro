import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { progressPhotos } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut, storageGet } from "../storage";

export const progressRouter = router({
  /* ─── Upload progress photo ─── */
  uploadPhoto: protectedProcedure
    .input(
      z.object({
        photoBase64: z.string().min(100), // base64 encoded image
        angle: z.enum(["front", "side", "back"]),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.photoBase64, "base64");

        // Upload to S3
        const timestamp = Date.now();
        const fileKey = `progress-photos/${ctx.user.id}/${input.angle}-${timestamp}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        // Save to database
        const [result] = await db.insert(progressPhotos).values({
          userId: ctx.user.id,
          photoUrl: url,
          angle: input.angle,
          notes: input.notes || null,
          date: new Date(),
        });

        return {
          id: result.insertId,
          photoUrl: url,
          angle: input.angle,
          date: new Date(),
        };
      } catch (err) {
        console.error("Photo upload error:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload photo",
        });
      }
    }),

  /* ─── Get all photos for user ─── */
  listPhotos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const photos = await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, ctx.user.id))
      .orderBy(desc(progressPhotos.date));

    return photos.map((p) => ({
      id: p.id,
      photoUrl: p.photoUrl,
      angle: p.angle,
      date: p.date,
      notes: p.notes,
    }));
  }),

  /* ─── Get photos by angle for comparison ─── */
  getPhotosByAngle: protectedProcedure
    .input(z.object({ angle: z.enum(["front", "side", "back"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const photos = await db
        .select()
        .from(progressPhotos)
        .where(and(eq(progressPhotos.userId, ctx.user.id), eq(progressPhotos.angle, input.angle)))
        .orderBy(desc(progressPhotos.date));

      return photos.map((p) => ({
        id: p.id,
        photoUrl: p.photoUrl,
        angle: p.angle,
        date: p.date,
        notes: p.notes,
      }));
    }),

  /* ─── Delete a photo ─── */
  deletePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Verify ownership
      const photo = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.id, input.photoId))
        .limit(1);

      if (!photo[0] || photo[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your photo" });
      }

      await db.delete(progressPhotos).where(eq(progressPhotos.id, input.photoId));

      return { success: true };
    }),

  /* ─── Get comparison pair (oldest vs newest for angle) ─── */
  getComparisonPair: protectedProcedure
    .input(z.object({ angle: z.enum(["front", "side", "back"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const photos = await db
        .select()
        .from(progressPhotos)
        .where(and(eq(progressPhotos.userId, ctx.user.id), eq(progressPhotos.angle, input.angle)))
        .orderBy(progressPhotos.date);

      if (photos.length < 2) {
        return null; // Need at least 2 photos for comparison
      }

      const oldest = photos[0];
      const newest = photos[photos.length - 1];
      const daysDiff = Math.floor(
        (newest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        before: {
          id: oldest.id,
          photoUrl: oldest.photoUrl,
          date: oldest.date,
          notes: oldest.notes,
        },
        after: {
          id: newest.id,
          photoUrl: newest.photoUrl,
          date: newest.date,
          notes: newest.notes,
        },
        daysDiff,
      };
    }),
});
