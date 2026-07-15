import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { users, accessRequests } from "../../db/schema.js";
import { UpdateProfileSchema, UpdateMessageSchema, UpdateLocationSchema } from "@ahoj/shared";
import { verifyAccessToken } from "../auth/auth.service.js";
import { sql } from "drizzle-orm";

// Shared auth preHandler
async function requireAuth(request: any, reply: any) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Authentication required" });
  }
  try {
    const payload = await verifyAccessToken(authHeader.slice(7));
    request.userId = payload.sub;
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /users/me
  app.get("/me", { preHandler: requireAuth }, async (request: any, reply) => {
    const [user] = await app.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        profilePhotoUrl: users.profilePhotoUrl,
        bio: users.bio,
        website: users.website,
        socialLinks: users.socialLinks,
        photoAlbum: users.photoAlbum,
        message: users.message,
        privacyMode: users.privacyMode,
        lastActive: users.lastActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);

    if (!user) return reply.status(404).send({ error: "User not found" });
    return user;
  });

  // PUT /users/me
  app.put("/me", { preHandler: requireAuth }, async (request: any, reply) => {
    const body = UpdateProfileSchema.parse(request.body);
    const [updated] = await app.db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, request.userId))
      .returning();
    return updated;
  });

  // PUT /users/me/message
  app.put("/me/message", { preHandler: requireAuth }, async (request: any, reply) => {
    const { message } = UpdateMessageSchema.parse(request.body);
    await app.db
      .update(users)
      .set({ message, updatedAt: new Date() })
      .where(eq(users.id, request.userId));
    return { message };
  });

  // PUT /users/me/location (REST fallback — prefer Socket.io for live updates)
  app.put("/me/location", { preHandler: requireAuth }, async (request: any, reply) => {
    const { lat, lng } = UpdateLocationSchema.parse(request.body);
    await app.db
      .update(users)
      .set({
        location: sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`,
        lastActive: new Date(),
      })
      .where(eq(users.id, request.userId));
    return { success: true };
  });

  // POST /users/me/fcm
  app.post("/me/fcm", { preHandler: requireAuth }, async (request: any, reply) => {
    const { fcmToken } = z.object({ fcmToken: z.string() }).parse(request.body);
    await app.db
      .update(users)
      .set({ fcmToken, updatedAt: new Date() })
      .where(eq(users.id, request.userId));
    return { success: true };
  });

  // GET /users/:id (public profile)
  app.get("/:id", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const [user] = await app.db
      .select({
        id: users.id,
        username: users.username,
        profilePhotoUrl: users.profilePhotoUrl,
        bio: users.bio,
        website: users.website,
        socialLinks: users.socialLinks,
        photoAlbum: users.photoAlbum,
        message: users.message,
        privacyMode: users.privacyMode,
        lastActive: users.lastActive,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.isBanned, false)))
      .limit(1);

    if (!user) return reply.status(404).send({ error: "User not found" });

    // Check if there is an access request between requester and target
    const [access] = await app.db
      .select({ status: accessRequests.status })
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.requesterId, request.userId),
          eq(accessRequests.targetId, id)
        )
      )
      .limit(1);

    const accessStatus = access?.status ?? null;

    const responseUser = {
      ...user,
      accessStatus,
    };

    // Hide/blur profile data for private users unless access is approved
    if (user.privacyMode === "PRIVATE" && accessStatus !== "APPROVED") {
      responseUser.profilePhotoUrl = null;
      responseUser.bio = null;
      responseUser.photoAlbum = [];
    }

    return responseUser;
  });
};
