import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { accessRequests, users } from "../../db/schema.js";
import { verifyAccessToken } from "../auth/auth.service.js";
import { sendPushNotification } from "../../utils/notifications.js";

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

export const accessRequestsRoutes: FastifyPluginAsync = async (app) => {
  // POST / — request access to a private profile's stories
  app.post("/", { preHandler: requireAuth }, async (request: any, reply) => {
    const { targetId } = request.body as { targetId: string };

    const [existing] = await app.db
      .select()
      .from(accessRequests)
      .where(and(eq(accessRequests.requesterId, request.userId), eq(accessRequests.targetId, targetId), eq(accessRequests.status, "PENDING")))
      .limit(1);

    if (existing) return reply.status(400).send({ error: "Pending request already exists" });

    const [req] = await app.db
      .insert(accessRequests)
      .values({ requesterId: request.userId, targetId })
      .returning();

    return reply.status(201).send(req);
  });

  // GET /incoming — list incoming pending requests
  app.get("/incoming", { preHandler: requireAuth }, async (request: any) => {
    return app.db
      .select({
        id: accessRequests.id,
        requesterId: accessRequests.requesterId,
        targetId: accessRequests.targetId,
        status: accessRequests.status,
        createdAt: accessRequests.createdAt,
        updatedAt: accessRequests.updatedAt,
        requester: {
          id: users.id,
          username: users.username,
          profilePhotoUrl: users.profilePhotoUrl,
        }
      })
      .from(accessRequests)
      .innerJoin(users, eq(accessRequests.requesterId, users.id))
      .where(and(eq(accessRequests.targetId, request.userId), eq(accessRequests.status, "PENDING")));
  });

  // PUT /:id/approve — approve request
  app.put("/:id/approve", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };

    const [updated] = await app.db
      .update(accessRequests)
      .set({ status: "APPROVED", updatedAt: new Date() })
      .where(and(eq(accessRequests.id, id), eq(accessRequests.targetId, request.userId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Request not found" });

    // Send push notification asynchronously to the requester
    (async () => {
      try {
        const [targetUser] = await app.db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, request.userId))
          .limit(1);

        if (targetUser) {
          await sendPushNotification(
            updated.requesterId,
            "Přístup schválen 🔓",
            `@${targetUser.username} schválil tvou žádost o přístup.`
          );
        }
      } catch (err) {
        app.log.error(err, "Failed to trigger access approved push notification");
      }
    })();

    return updated;
  });

  // PUT /:id/deny — deny request
  app.put("/:id/deny", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };

    const [updated] = await app.db
      .update(accessRequests)
      .set({ status: "DENIED", updatedAt: new Date() })
      .where(and(eq(accessRequests.id, id), eq(accessRequests.targetId, request.userId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Request not found" });
    return updated;
  });
};
