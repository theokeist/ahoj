import { z } from "zod";

export * from "./i18n";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PrivacyMode = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  GHOST: "GHOST",
} as const;

export type PrivacyMode = (typeof PrivacyMode)[keyof typeof PrivacyMode];

export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const AccessRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;

export type AccessRequestStatus =
  (typeof AccessRequestStatus)[keyof typeof AccessRequestStatus];

export const MessageType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const OAuthProvider = {
  GOOGLE: "google",
  APPLE: "apple",
  META: "meta",
  NETID: "netid",
  VK: "vk",
  YANDEX: "yandex",
  WECHAT: "wechat",
  LINE: "line",
  KAKAO: "kakao",
} as const;

export type OAuthProvider = (typeof OAuthProvider)[keyof typeof OAuthProvider];

// ─── Constants ────────────────────────────────────────────────────────────────

export const AHOJ_CONSTANTS = {
  MESSAGE_MAX_LENGTH: 60,
  BIO_MAX_LENGTH: 160,
  STORY_DURATION_HOURS: 24,
  DEFAULT_FEED_RADIUS_KM: 2,
  MAX_FEED_RADIUS_KM: 5,
  MIN_FEED_RADIUS_M: 100,
  LOCATION_UPDATE_INTERVAL_MS: 60_000,
  MIN_AGE: 16,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_RATE_LIMIT_WINDOW_MIN: 15,
  API_RATE_LIMIT_PER_MIN: 100,
  SPARK_DURATION_HOURS: 2,
} as const;

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  dateOfBirth: z.string().date().optional(), // ISO date string
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const OAuthAuthSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  providerUserId: z.string().min(1),
  email: z.string().email().optional().nullable(),
  username: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(AHOJ_CONSTANTS.BIO_MAX_LENGTH).optional().nullable(),
});

export const UpdateProfileSchema = z.object({
  bio: z.string().max(AHOJ_CONSTANTS.BIO_MAX_LENGTH).optional(),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  privacyMode: z.enum(["PUBLIC", "PRIVATE", "GHOST"]).optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  photoAlbum: z.array(z.string()).optional(),
});

export const UpdateMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(AHOJ_CONSTANTS.MESSAGE_MAX_LENGTH)
    .refine((val) => !val.match(/https?:\/\//i), "Links are not allowed"),
});

export const UpdateLocationSchema = LocationSchema;

export const FeedQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce
    .number()
    .min(AHOJ_CONSTANTS.MIN_FEED_RADIUS_M / 1000)
    .max(AHOJ_CONSTANTS.MAX_FEED_RADIUS_KM)
    .default(AHOJ_CONSTANTS.DEFAULT_FEED_RADIUS_KM),
  cursor: z.string().optional(), // for cursor-based pagination
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const CreateSparkSchema = z.object({
  title: z.string().min(3).max(60),
  description: z.string().max(300).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  category: z.enum(["COFFEE", "SPORTS", "PARTY", "STUDY", "MEETUP", "OTHER"]).default("MEETUP"),
});

export const UserSettingsSchema = z.object({
  privacyMode: z.enum(["PUBLIC", "PRIVATE", "GHOST"]).default("PUBLIC"),
  ghostFuzzRadiusMeters: z.number().min(50).max(1000).default(300),
  allowDirectMessages: z.enum(["EVERYONE", "APPROVED", "NOBODY"]).default("EVERYONE"),
  showDistanceToOthers: z.boolean().default(true),
  notifications: z.object({
    pushEnabled: z.boolean().default(true),
    nearbyUsersAlert: z.boolean().default(true),
    sparksAlert: z.boolean().default(true),
    messagesAlert: z.boolean().default(true),
    accessRequestAlert: z.boolean().default(true),
    soundEnabled: z.boolean().default(true),
  }).default({
    pushEnabled: true,
    nearbyUsersAlert: true,
    sparksAlert: true,
    messagesAlert: true,
    accessRequestAlert: true,
    soundEnabled: true,
  }),
  language: z.enum(["cs", "en", "de", "sk", "pl", "uk", "ru", "zh", "ja"]).default("cs"),
  distanceUnit: z.enum(["metric", "imperial"]).default("metric"),
  autoPlayVideos: z.enum(["always", "wifi", "never"]).default("wifi"),
  mediaUploadQuality: z.enum(["high", "standard", "saver"]).default("high"),
});

export const UpdateUserSettingsSchema = UserSettingsSchema.partial();

export type UserSettingsType = z.infer<typeof UserSettingsSchema>;
export type UpdateUserSettingsType = z.infer<typeof UpdateUserSettingsSchema>;

// ─── Response Types ───────────────────────────────────────────────────────────

export type UserPublic = {
  id: string;
  username: string;
  profilePhotoUrl: string | null;
  bio: string | null;
  message: string;
  privacyMode: PrivacyMode;
  /** Distance in meters from the requester */
  distanceMeters: number;
  hasActiveStories: boolean;
  lastActive: string; // ISO string
  accessStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
};

export type UserProfile = UserPublic & {
  email: string | null;
  website: string | null;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  photoAlbum: string[] | null;
  oauthProviders?: string[];
};

export type StoryPublic = {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: MediaType;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: string;
  readAt: string | null;
};

export type AccessRequest = {
  id: string;
  requesterId: string;
  targetId: string;
  status: AccessRequestStatus;
  createdAt: string;
};

export type SparkPublic = {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl: string | null;
  title: string;
  description: string | null;
  category: "COFFEE" | "SPORTS" | "PARTY" | "STUDY" | "MEETUP" | "OTHER";
  lat: number;
  lng: number;
  distanceMeters: number;
  createdAt: string;
  expiresAt: string;
};

// ─── Socket.io Events ─────────────────────────────────────────────────────────

export type ServerToClientEvents = {
  "feed:update": (users: UserPublic[]) => void;
  "message:new": (message: ChatMessage) => void;
  "story:new": (data: { userId: string }) => void;
  "spark:new": (spark: SparkPublic) => void;
  "access:approved": (data: { requestId: string; userId: string }) => void;
  "access:denied": (data: { requestId: string }) => void;
  "user:typing": (data: { chatId: string; userId: string }) => void;
  "user:typing_stop": (data: { chatId: string; userId: string }) => void;
};

export type ClientToServerEvents = {
  "location:update": (location: { lat: number; lng: number }) => void;
  "chat:join": (chatId: string) => void;
  "chat:leave": (chatId: string) => void;
  "typing:start": (chatId: string) => void;
  "typing:stop": (chatId: string) => void;
};
