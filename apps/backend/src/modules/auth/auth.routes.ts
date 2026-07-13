import type { FastifyPluginAsync } from "fastify";
import { RegisterSchema, LoginSchema } from "@ahoj/shared";
import {
  registerUser,
  loginUser,
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "./auth.service.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/register
  app.post("/register", {
    schema: {
      description: "Register a new ahoj account",
      tags: ["auth"],
      body: {
        type: "object",
        required: ["username", "email", "password", "dateOfBirth"],
        properties: {
          username: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          dateOfBirth: { type: "string", format: "date" },
        },
      },
    },
    handler: async (request, reply) => {
      const body = RegisterSchema.parse(request.body);

      try {
        const user = await registerUser(body);
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);
        await saveRefreshToken(user.id, refreshToken);

        reply.setCookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30,
          path: "/auth/refresh",
        });

        return reply.status(201).send({
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            message: user.message,
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.startsWith("EMAIL_TAKEN")) {
          return reply.status(409).send({ error: "Email already in use" });
        }
        if (msg.startsWith("USERNAME_TAKEN")) {
          return reply.status(409).send({ error: "Username already taken" });
        }
        if (msg.startsWith("UNDERAGE")) {
          return reply.status(403).send({ error: "Must be 16+ to use ahoj" });
        }
        throw err;
      }
    },
  });

  // POST /auth/login
  app.post("/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "15 minutes",
        errorResponseBuilder: () => ({
          statusCode: 429,
          error: "Too Many Requests",
          message: "Too many login attempts. Wait 15 minutes.",
        }),
      },
    },
    handler: async (request, reply) => {
      const body = LoginSchema.parse(request.body);

      try {
        const user = await loginUser(body);
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);
        await saveRefreshToken(user.id, refreshToken);

        reply.setCookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30,
          path: "/auth/refresh",
        });

        return {
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            message: user.message,
            privacyMode: user.privacyMode,
            profilePhotoUrl: user.profilePhotoUrl,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === "INVALID_CREDENTIALS") {
          return reply.status(401).send({ error: "Invalid email or password" });
        }
        if (msg === "ACCOUNT_BANNED") {
          return reply.status(403).send({ error: "Account suspended" });
        }
        throw err;
      }
    },
  });

  // POST /auth/refresh — uses httpOnly cookie
  app.post("/refresh", async (request, reply) => {
    const token = request.cookies.refresh_token;
    if (!token) {
      return reply.status(401).send({ error: "No refresh token" });
    }

    try {
      const payload = await verifyRefreshToken(token);
      const userId = payload.sub as string;

      const newAccessToken = await signAccessToken(userId);
      const newRefreshToken = await signRefreshToken(userId);

      await revokeRefreshToken(token);
      await saveRefreshToken(userId, newRefreshToken);

      reply.setCookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/auth/refresh",
      });

      return { accessToken: newAccessToken };
    } catch {
      return reply.status(401).send({ error: "Invalid or expired refresh token" });
    }
  });

  // POST /auth/logout
  app.post("/logout", async (request, reply) => {
    const token = request.cookies.refresh_token;
    if (token) {
      await revokeRefreshToken(token);
    }
    reply.clearCookie("refresh_token", { path: "/auth/refresh" });
    return { success: true };
  });
};
