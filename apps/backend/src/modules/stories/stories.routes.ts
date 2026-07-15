import type { FastifyPluginAsync } from "fastify";
import { eq, and, gt, desc, asc } from "drizzle-orm";
import { stories, storyViews, users } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "../auth/auth.service.js";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";

const uploadsDir = path.resolve(__dirname, "../../../uploads");

async function requireAuth(request: any, reply: any) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return reply.status(401).send({ error: "Authentication required" });
  try {
    const payload = await verifyAccessToken(authHeader.slice(7));
    request.userId = payload.sub;
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export const storiesRoutes: FastifyPluginAsync = async (app) => {
  // POST /stories/upload — direct image upload for local testing
  app.post("/upload", { preHandler: requireAuth }, async (request: any, reply) => {
    const fileData = await request.file();
    if (!fileData) {
      return reply.status(400).send({ error: "No file provided" });
    }

    try {
      const fileExtension = path.extname(fileData.filename) || ".jpg";
      const filename = `${crypto.randomUUID()}${fileExtension}`;
      const filePath = path.join(uploadsDir, filename);

      await pipeline(fileData.file, fs.createWriteStream(filePath));

      const protocol = request.headers["x-forwarded-proto"] || "http";
      const host = request.headers["x-forwarded-host"] || request.hostname;
      const mediaUrl = `${protocol}://${host}/uploads/${filename}`;

      return { mediaUrl };
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to upload file" });
    }
  });

  // POST /stories — upload new story (S3 presigned URL flow)
  app.post("/", { preHandler: requireAuth }, async (request: any, reply) => {
    const { mediaUrl, mediaType } = request.body as { mediaUrl: string; mediaType: "IMAGE" | "VIDEO" };
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h

    const [story] = await app.db
      .insert(stories)
      .values({ userId: request.userId, mediaUrl, mediaType, expiresAt })
      .returning();

    return reply.status(201).send(story);
  });

  // GET /stories/:userId — get active stories for a user
  app.get("/:userId", { preHandler: requireAuth }, async (request: any, reply) => {
    const { userId } = request.params as { userId: string };
    const now = new Date();

    const userStories = await app.db
      .select()
      .from(stories)
      .where(and(eq(stories.userId, userId), gt(stories.expiresAt, now)))
      .orderBy(asc(stories.createdAt));

    return userStories;
  });

  // POST /stories/:id/view — mark story as viewed
  app.post("/:id/view", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    await app.db
      .insert(storyViews)
      .values({ storyId: id, viewerId: request.userId })
      .onConflictDoNothing();
    return { success: true };
  });

  // DELETE /stories/:id
  app.delete("/:id", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    await app.db
      .delete(stories)
      .where(and(eq(stories.id, id), eq(stories.userId, request.userId)));
    return { success: true };
  });
};
