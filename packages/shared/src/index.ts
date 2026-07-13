import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const PrivacyMode = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
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
  dateOfBirth: z.string().date(), // ISO date string for age verification
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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
  privacyMode: z.enum(["PUBLIC", "PRIVATE"]).optional(),
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
};

export type UserProfile = UserPublic & {
  website: string | null;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
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

// ─── Socket.io Events ─────────────────────────────────────────────────────────

export type ServerToClientEvents = {
  "feed:update": (users: UserPublic[]) => void;
  "message:new": (message: ChatMessage) => void;
  "story:new": (data: { userId: string }) => void;
  "access:approved": (data: { requestId: string; userId: string }) => void;
  "access:denied": (data: { requestId: string }) => void;
  "user:typing": (data: { chatId: string; userId: string }) => void;
};

export type ClientToServerEvents = {
  "location:update": (location: { lat: number; lng: number }) => void;
  "chat:join": (chatId: string) => void;
  "chat:leave": (chatId: string) => void;
  "typing:start": (chatId: string) => void;
  "typing:stop": (chatId: string) => void;
};
