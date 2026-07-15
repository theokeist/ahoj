import type { FastifyPluginAsync } from "fastify";
import { eq, and, desc, lt, ne, inArray } from "drizzle-orm";
import { chats, chatParticipants, messages, users } from "../../db/schema.js";
import { verifyAccessToken } from "../auth/auth.service.js";
import { sendPushNotification } from "../../utils/notifications.js";

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
      .select({
        chatId: chats.id,
        createdAt: chats.createdAt,
        lastMessageAt: chats.lastMessageAt,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .where(eq(chatParticipants.userId, request.userId))
      .orderBy(desc(chats.lastMessageAt));

    const detailedChats = await Promise.all(
      userChats.map(async (chat) => {
        const [partner] = await app.db
          .select({
            id: users.id,
            username: users.username,
            profilePhotoUrl: users.profilePhotoUrl,
            privacyMode: users.privacyMode,
          })
          .from(chatParticipants)
          .innerJoin(users, eq(chatParticipants.userId, users.id))
          .where(
            and(
              eq(chatParticipants.chatId, chat.chatId),
              ne(chatParticipants.userId, request.userId)
            )
          )
          .limit(1);

        const [lastMessage] = await app.db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chat.chatId))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          id: chat.chatId,
          createdAt: chat.createdAt,
          lastMessageAt: chat.lastMessageAt,
          partner: partner || null,
          lastMessage: lastMessage || null,
        };
      })
    );

    return detailedChats;
  });

  // POST /chats — create or get existing chat with another user
  app.post("/", { preHandler: requireAuth }, async (request: any, reply) => {
    const { participantId } = request.body as { participantId: string };

    const myChats = await app.db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, request.userId));

    if (myChats.length > 0) {
      const sharedChat = await app.db
        .select({ chatId: chatParticipants.chatId })
        .from(chatParticipants)
        .where(
          and(
            eq(chatParticipants.userId, participantId),
            inArray(
              chatParticipants.chatId,
              myChats.map((c) => c.chatId)
            )
          )
        )
        .limit(1);

      if (sharedChat.length > 0) {
        return reply.send({ id: sharedChat[0].chatId });
      }
    }

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

    await app.db
      .update(chats)
      .set({ lastMessageAt: new Date() })
      .where(eq(chats.id, id));

    (app as any).io?.to(`chat:${id}`).emit("message:new", message);

    // Send push notification asynchronously to the recipient
    (async () => {
      try {
        const otherParticipants = await app.db
          .select({ userId: chatParticipants.userId })
          .from(chatParticipants)
          .where(and(eq(chatParticipants.chatId, id), ne(chatParticipants.userId, request.userId)));

        const [sender] = await app.db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, request.userId))
          .limit(1);

        if (otherParticipants.length > 0 && sender) {
          await sendPushNotification(
            otherParticipants[0].userId,
            `Nová zpráva od @${sender.username}`,
            content,
            { chatId: id, senderId: request.userId }
          );
        }
      } catch (err) {
        app.log.error(err, "Failed to trigger push notification");
      }
    })();

    return reply.status(201).send(message);
  });
};
