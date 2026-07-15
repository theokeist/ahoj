import type { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@ahoj/shared";
import type { DB } from "../../db/index.js";
import type Redis from "ioredis";
import { verifyAccessToken } from "../auth/auth.service.js";
import { sql } from "drizzle-orm";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

type AhojServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: AhojServer, db: DB, redis: Redis) {
  // ─── Auth middleware ────────────────────────────────────────────────────────

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = await verifyAccessToken(token);
      socket.data.userId = payload.sub as string;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ─── Connection ─────────────────────────────────────────────────────────────

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log(`🔌 Socket connected: ${userId}`);

    // Join personal room for targeted events
    socket.join(`user:${userId}`);

    // ─── Location updates ───────────────────────────────────────────────────

    socket.on("location:update", async ({ lat, lng }) => {
      if (typeof lat !== "number" || typeof lng !== "number") return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      try {
        // Update location in database
        await db
          .update(users)
          .set({
            location: sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`,
            lastActive: new Date(),
          })
          .where(eq(users.id, userId));

        // Cache latest location in Redis (fast reads)
        await redis.setex(
          `location:${userId}`,
          120,
          JSON.stringify({ lat, lng, ts: Date.now() })
        );
      } catch (err) {
        console.error("location:update error", err);
      }
    });

    // ─── Chat room management ───────────────────────────────────────────────

    socket.on("chat:join", (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("chat:leave", (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // ─── Typing indicators ──────────────────────────────────────────────────

    socket.on("typing:start", (chatId) => {
      socket.to(`chat:${chatId}`).emit("user:typing", { chatId, userId });
    });

    socket.on("typing:stop", (chatId) => {
      socket.to(`chat:${chatId}`).emit("user:typing_stop", { chatId, userId });
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────

    socket.on("disconnect", async () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
      await db
        .update(users)
        .set({ lastActive: new Date() })
        .where(eq(users.id, userId));
    });
  });

  console.log("✅ Socket.io handlers registered");
}
