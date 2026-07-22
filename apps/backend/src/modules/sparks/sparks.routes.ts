import type { FastifyPluginAsync } from "fastify";
import { CreateSparkSchema } from "@ahoj/shared";
import { createSpark, getNearbySparks, deleteSpark } from "./sparks.service.js";
import { verifyAccessToken } from "../auth/auth.service.js";
import { db } from "../../db/index.js";

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

export const sparksRoutes: FastifyPluginAsync = async (app) => {
  // GET /sparks?lat=&lng=&radius=
  app.get("/", async (request, reply) => {
    const { lat, lng, radius } = request.query as {
      lat: number;
      lng: number;
      radius?: number;
    };

    const sparks = await getNearbySparks(db, {
      lat: Number(lat),
      lng: Number(lng),
      radiusKm: Number(radius || 5),
    });

    return { sparks };
  });

  // POST /sparks (Protected)
  app.post("/", { preHandler: requireAuth }, async (request: any, reply) => {
    const body = CreateSparkSchema.parse(request.body);
    const userId = request.userId;

    const spark = await createSpark(db, {
      userId,
      title: body.title,
      description: body.description,
      category: body.category,
      lat: body.lat,
      lng: body.lng,
    });

    return reply.status(201).send({ spark });
  });

  // DELETE /sparks/:id (Protected)
  app.delete("/:id", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.userId;

    await deleteSpark(db, id, userId);
    return { success: true };
  });
};
