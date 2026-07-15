import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  pgEnum,
  customType,
  jsonb,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// ─── PostGIS custom type ──────────────────────────────────────────────────────

const geometry = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "geography(POINT, 4326)";
  },
});

// ─── Enums ────────────────────────────────────────────────────────────────────

export const privacyModeEnum = pgEnum("privacy_mode", ["PUBLIC", "PRIVATE"]);
export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "VIDEO"]);
export const accessRequestStatusEnum = pgEnum("access_request_status", [
  "PENDING",
  "APPROVED",
  "DENIED",
]);
export const messageTypeEnum = pgEnum("message_type", [
  "TEXT",
  "IMAGE",
  "VIDEO",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "REVIEWED",
  "DISMISSED",
  "ACTION_TAKEN",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 30 }).notNull().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    profilePhotoUrl: text("profile_photo_url"),
    bio: varchar("bio", { length: 160 }),
    website: text("website"),
    socialLinks: jsonb("social_links").$type<{
      instagram?: string;
      twitter?: string;
      tiktok?: string;
    }>(),
    photoAlbum: jsonb("photo_album").$type<string[]>().default(sql`'[]'::jsonb`),
    message: varchar("message", { length: 60 }).notNull(),
    privacyMode: privacyModeEnum("privacy_mode").notNull().default("PUBLIC"),
    /** PostGIS GEOGRAPHY point — updated every 60s */
    location: geometry("location"),
    dateOfBirth: timestamp("date_of_birth").notNull(),
    isVerified: boolean("is_verified").default(false),
    isBanned: boolean("is_banned").default(false),
    warningCount: integer("warning_count").default(0),
    fcmToken: text("fcm_token"),
    lastActive: timestamp("last_active").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    locationIdx: index("idx_users_location").on(table.location),
    lastActiveIdx: index("idx_users_last_active").on(table.lastActive),
  })
);

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaUrl: text("media_url").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    pinnedLocation: geometry("pinned_location"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(), // +24h from createdAt
  },
  (table) => ({
    userIdIdx: index("idx_stories_user_id").on(table.userId),
    expiresAtIdx: index("idx_stories_expires_at").on(table.expiresAt),
  })
);

export const storyViews = pgTable("story_views", {
  storyId: uuid("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  viewerId: uuid("viewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const accessRequests = pgTable(
  "access_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: accessRequestStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    requesterTargetIdx: index("idx_access_requester_target").on(
      table.requesterId,
      table.targetId
    ),
  })
);

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    /** Encrypted content — Signal Protocol encrypted on client */
    content: text("content").notNull(),
    type: messageTypeEnum("type").notNull().default("TEXT"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (table) => ({
    chatIdIdx: index("idx_messages_chat_id").on(table.chatId),
    createdAtIdx: index("idx_messages_created_at").on(table.createdAt),
  })
);

export const blocks = pgTable("blocks", {
  blockerId: uuid("blocker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blockedId: uuid("blocked_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetId: uuid("target_id").notNull(),
  targetType: text("target_type").notNull(), // 'user' | 'story' | 'message'
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
