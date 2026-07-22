import type { FastifyPluginAsync } from "fastify";
import { RegisterSchema, LoginSchema, OAuthAuthSchema } from "@ahoj/shared";
import {
  registerUser,
  loginUser,
  loginOrRegisterOAuthUser,
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "./auth.service.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /auth/register
  app.post("/register", async (request, reply) => {
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
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          message: user.message,
          profilePhotoUrl: user.profilePhotoUrl,
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
  });

  // POST /auth/login
  app.post("/login", async (request, reply) => {
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

      return reply.send({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          message: user.message,
          privacyMode: user.privacyMode,
          profilePhotoUrl: user.profilePhotoUrl,
        },
      });
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
  });

  // POST /auth/oauth — Global 3rd Party OAuth handler (US, EU, RU, Asia)
  app.post("/oauth", async (request, reply) => {
    const body = OAuthAuthSchema.parse(request.body);

    try {
      const user = await loginOrRegisterOAuthUser(body);
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

      return reply.status(200).send({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          message: user.message,
          privacyMode: user.privacyMode,
          profilePhotoUrl: user.profilePhotoUrl,
          bio: user.bio,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "ACCOUNT_BANNED") {
        return reply.status(403).send({ error: "Account suspended" });
      }
      throw err;
    }
  });

  // POST /auth/refresh — supports httpOnly cookies & mobile JSON storage
  app.post("/refresh", async (request: any, reply) => {
    const token =
      request.cookies.refresh_token ||
      request.body?.refreshToken ||
      request.headers["x-refresh-token"];

    if (!token) {
      return reply.status(401).send({ error: "No refresh token provided" });
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

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      return reply.status(401).send({ error: "Invalid or expired refresh token" });
    }
  });

  // POST /auth/logout
  app.post("/logout", async (request: any, reply) => {
    const token =
      request.cookies.refresh_token ||
      request.body?.refreshToken ||
      request.headers["x-refresh-token"];

    if (token) {
      await revokeRefreshToken(token);
    }
    reply.clearCookie("refresh_token", { path: "/auth/refresh" });
    return { success: true };
  });
};
