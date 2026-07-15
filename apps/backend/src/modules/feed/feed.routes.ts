import type { FastifyPluginAsync } from "fastify";
import { FeedQuerySchema } from "@ahoj/shared";
import { getProximityFeed } from "./feed.service.js";
import { verifyAccessToken } from "../auth/auth.service.js";
import { users } from "../../db/schema.js";
import { sql, eq } from "drizzle-orm";

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

  // POST /feed/seed-demo — Seeding relative mock users dynamically
  app.post("/seed-demo", async (request: any, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Authentication required" });
    }

    let userId: string;
    try {
      const payload = await verifyAccessToken(authHeader.slice(7));
      userId = payload.sub as string;
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }

    try {
      const [me] = await app.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      let centerLng = 16.6079;
      let centerLat = 49.1951;

      if (me && me.location) {
        const coords = await app.db.execute(sql`
          SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat 
          FROM users 
          WHERE id = ${userId}
          LIMIT 1
        `);
        const row = Array.isArray(coords) && coords.length > 0 ? coords[0] : null;
        if (row && row.lng && row.lat) {
          centerLng = parseFloat(String(row.lng));
          centerLat = parseFloat(String(row.lat));
        }
      } else {
        await app.db
          .update(users)
          .set({
            location: sql`ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography`,
            lastActive: new Date(),
          })
          .where(eq(users.id, userId));
      }

      const offsets = [
        { email: "bob@ahoj.app", lng: 0.0005, lat: 0.0005 },
        { email: "alice@ahoj.app", lng: -0.0008, lat: -0.0004 },
        { email: "charlie@ahoj.app", lng: 0.0007, lat: -0.0006 }
      ];

      for (const item of offsets) {
        const userLng = centerLng + item.lng;
        const userLat = centerLat + item.lat;
        await app.db
          .update(users)
          .set({
            location: sql`ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography`,
            lastActive: new Date()
          })
          .where(eq(users.email, item.email));
      }

      return { success: true };
    } catch (err: any) {
      app.log.error(err);
      return reply.status(500).send({ error: "Failed to seed demo users" });
    }
  });
};
