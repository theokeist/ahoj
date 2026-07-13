import type { FastifyPluginAsync } from "fastify";
import { eq, and, desc, lt } from "drizzle-orm";
import { chats, chatParticipants, messages } from "../../db/schema.js";
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

export const chatsRoutes: FastifyPluginAsync = async (app) => {
  // GET /chats — list all conversations for the current user
  app.get("/", { preHandler: requireAuth }, async (request: any) => {
    const userChats = await app.db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, request.userId));

    return userChats.map((c) => c.chatId);
  });

  // POST /chats — create or get existing chat with another user
  app.post("/", { preHandler: requireAuth }, async (request: any, reply) => {
    const { participantId } = request.body as { participantId: string };

    // Create chat
    const [chat] = await app.db.insert(chats).values({}).returning();

    await app.db.insert(chatParticipants).values([
      { chatId: chat.id, userId: request.userId },
      { chatId: chat.id, userId: participantId },
    ]);

    return reply.status(201).send(chat);
  });

  // GET /chats/:id/messages — paginated message history
  app.get("/:id/messages", { preHandler: requireAuth }, async (request: any) => {
    const { id } = request.params as { id: string };
    const { cursor, limit = 30 } = request.query as { cursor?: string; limit?: number };

    const query = app.db
      .select()
      .from(messages)
      .where(
        cursor
          ? and(eq(messages.chatId, id), lt(messages.createdAt, new Date(cursor)))
          : eq(messages.chatId, id)
      )
      .orderBy(desc(messages.createdAt))
      .limit(Number(limit));

    return query;
  });

  // POST /chats/:id/messages — send a message
  app.post("/:id/messages", { preHandler: requireAuth }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const { content, type = "TEXT" } = request.body as { content: string; type?: "TEXT" | "IMAGE" | "VIDEO" };

    const [message] = await app.db
      .insert(messages)
      .values({ chatId: id, senderId: request.userId, content, type })
      .returning();

    // Emit via Socket.io to chat room
    // (io instance needs to be shared — add via app.decorate in production)

    return reply.status(201).send(message);
  });
};
