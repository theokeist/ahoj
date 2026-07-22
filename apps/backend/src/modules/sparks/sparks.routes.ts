import type { FastifyPluginAsync } from "fastify";
import { CreateSparkSchema } from "@ahoj/shared";
import { createSpark, getNearbySparks, deleteSpark } from "./sparks.service.js";
import { db } from "../../db/index.js";

export const sparksRoutes: FastifyPluginAsync = async (app) => {
  // GET /sparks?lat=&lng=&radius=
  app.get("/", {
    schema: {
      description: "Get nearby spontaneous meetup pings (Sparks)",
      tags: ["sparks"],
      querystring: {
        type: "object",
        required: ["lat", "lng"],
        properties: {
          lat: { type: "number" },
          lng: { type: "number" },
          radius: { type: "number", default: 5 },
        },
      },
    },
    handler: async (request, reply) => {
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
    },
  });

  // POST /sparks (Protected)
  app.post("/", {
    preHandler: [app.authenticate],
    schema: {
      description: "Create a new spontaneous meetup ping (Spark)",
      tags: ["sparks"],
      body: {
        type: "object",
        required: ["title", "lat", "lng"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
        },
      },
    },
    handler: async (request, reply) => {
      const body = CreateSparkSchema.parse(request.body);
      const userId = request.user.sub;

      const spark = await createSpark(db, {
        userId,
        title: body.title,
        description: body.description,
        category: body.category,
        lat: body.lat,
        lng: body.lng,
      });

      return reply.status(201).send({ spark });
    },
  });

  // DELETE /sparks/:id (Protected)
  app.delete("/:id", {
    preHandler: [app.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.sub;

      await deleteSpark(db, id, userId);
      return { success: true };
    },
  });
};
