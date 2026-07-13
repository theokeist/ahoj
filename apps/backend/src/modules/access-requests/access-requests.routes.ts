import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { accessRequests } from "../../db/schema.js";
import { verifyAccessToken } from "../auth/auth.service.js";

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
  // POST /access-requests/:targetId — request access to a private profile's stories
  app.post("/:targetId", { preHandler: requireAuth }, async (request: any, reply) => {
    const { targetId } = request.params as { targetId: string };

    const [existing] = await app.db
      .select()
      .from(accessRequests)
      .where(and(eq(accessRequests.requesterId, request.userId), eq(accessRequests.targetId, targetId)))
      .limit(1);

    if (existing) return existing;

    const [req] = await app.db
      .insert(accessRequests)
      .values({ requesterId: request.userId, targetId })
      .returning();

    return reply.status(201).send(req);
  });

  // GET /access-requests/incoming — list incoming pending requests
  app.get("/incoming", { preHandler: requireAuth }, async (request: any) => {
    return app.db
      .select()
      .from(accessRequests)
      .where(and(eq(accessRequests.targetId, request.userId), eq(accessRequests.status, "PENDING")));
  });

  // PUT /access-requests/:id — approve or deny
  app.put("/:id", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: "APPROVED" | "DENIED" };

    if (!["APPROVED", "DENIED"].includes(status)) {
      return reply.status(400).send({ error: "Invalid status" });
    }

    const [updated] = await app.db
      .update(accessRequests)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(accessRequests.id, id), eq(accessRequests.targetId, request.userId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Request not found" });
    return updated;
  });
};
