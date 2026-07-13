import type { FastifyPluginAsync } from "fastify";
import { FeedQuerySchema } from "@ahoj/shared";
import { getProximityFeed } from "./feed.service.js";
import { verifyAccessToken } from "../auth/auth.service.js";

export const feedRoutes: FastifyPluginAsync = async (app) => {
  // GET /feed?lat=&lng=&radius=&limit=&cursor=
  app.get("/", {
    schema: {
      description: "Get proximity feed of nearby users",
      tags: ["feed"],
      querystring: {
        type: "object",
        required: ["lat", "lng"],
        properties: {
          lat: { type: "number" },
          lng: { type: "number" },
          radius: { type: "number", default: 2 },
          limit: { type: "number", default: 20, maximum: 50 },
          cursor: { type: "string" },
        },
      },
    },
    preHandler: async (request, reply) => {
      // Auth: Bearer token required
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Authentication required" });
      }
      try {
        const payload = await verifyAccessToken(authHeader.slice(7));
        (request as any).userId = payload.sub;
      } catch {
        return reply.status(401).send({ error: "Invalid or expired token" });
      }
    },
    handler: async (request, reply) => {
      const query = FeedQuerySchema.parse(request.query);
      const userId = (request as any).userId as string;

      const users = await getProximityFeed(app.db ?? (request as any).server?.db, {
        requesterId: userId,
        lat: query.lat,
        lng: query.lng,
        radiusKm: query.radius,
        limit: query.limit,
        cursor: query.cursor,
      });

      // Cursor pagination — last item's distance is the next cursor
      const nextCursor =
        users.length === query.limit
          ? String(users[users.length - 1].distanceMeters)
          : null;

      return {
        users,
        nextCursor,
        count: users.length,
      };
    },
  });
};
