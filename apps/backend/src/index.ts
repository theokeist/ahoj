import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

import { config } from "./config/env.js";
import { AHOJ_CONSTANTS } from "@ahoj/shared";
import { db } from "./db/index.js";
import { redis } from "./utils/redis.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { infoRoutes } from "./modules/info/info.routes.js";
import { feedRoutes } from "./modules/feed/feed.routes.js";
import { storiesRoutes } from "./modules/stories/stories.routes.js";
import { chatsRoutes } from "./modules/chats/chats.routes.js";
import { accessRequestsRoutes } from "./modules/access-requests/access-requests.routes.js";
import { sparksRoutes } from "./modules/sparks/sparks.routes.js";
import { registerSocketHandlers } from "./modules/realtime/socket.handler.js";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@ahoj/shared";

async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.isDev ? "info" : "warn",
      transport: config.isDev
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
    trustProxy: true,
  });

  // ─── Plugins ───────────────────────────────────────────────────────────────

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
      },
    },
  });

  await app.register(cors, {
    origin: config.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(cookie, {
    secret: config.JWT_REFRESH_SECRET,
  });

  await app.register(rateLimit, {
    global: true,
    max: AHOJ_CONSTANTS.API_RATE_LIMIT_PER_MIN,
    timeWindow: "1 minute",
    redis,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded. Slow down!",
    }),
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: "/uploads/",
  });

  // ─── Global Error Handler ──────────────────────────────────────────────────

  app.setErrorHandler((error: any, request, reply) => {
    if (error.name === "ZodError" || (error as any).constructor?.name === "ZodError") {
      return reply.status(400).send({
        error: "Validation Error",
        message: "Invalid request payload",
        details: (error as any).issues,
      });
    }

    // Rate limiter error
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: "Too Many Requests",
        message: error.message,
      });
    }

    request.log.error(error);
    return reply.status(error.statusCode || 500).send({
      error: error.name || "Internal Server Error",
      message: error.message || "Something went wrong on our end",
    });
  });

  // ─── Decorators — share db and redis across routes ─────────────────────────

  app.decorate("db", db);
  app.decorate("redis", redis);
  app.decorate("io", null); // Populated in main()

  // ─── Routes ────────────────────────────────────────────────────────────────

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "/users" });
  await app.register(infoRoutes, { prefix: "/info" });
  await app.register(feedRoutes, { prefix: "/feed" });
  await app.register(storiesRoutes, { prefix: "/stories" });
  await app.register(chatsRoutes, { prefix: "/chats" });
  await app.register(accessRequestsRoutes, { prefix: "/access-requests" });
  await app.register(sparksRoutes, { prefix: "/sparks" });

  // ─── Health check ──────────────────────────────────────────────────────────

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  }));

  return app;
}

async function main() {
  const app = await buildApp();

  // ─── Socket.io (attached to underlying http.Server) ────────────────────────

  const httpServer = createServer(app.server);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: config.allowedOrigins,
      credentials: true,
    },
    pingTimeout: 30_000,
    pingInterval: 25_000,
  });

  app.io = io; // Make io available to routes

  registerSocketHandlers(io, db, redis);

  // ─── Connect to services ──────────────────────────────────────────────────

  await redis.connect();

  // ─── Start server ─────────────────────────────────────────────────────────

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    console.log(`\n🚀 ahoj backend running at http://${config.HOST}:${config.PORT}`);
    console.log(`📚 API docs: http://${config.HOST}:${config.PORT}/docs\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
