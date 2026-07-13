import Redis from "ioredis";
import { config } from "../config/env.js";

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

export const CACHE_KEYS = {
  USER_PROFILE: (id: string) => `user:profile:${id}`,
  FEED: (lat: number, lng: number, radius: number) =>
    `feed:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`,
  ACTIVE_STORIES: (userId: string) => `stories:active:${userId}`,
  SESSION: (token: string) => `session:${token}`,
  RATE_LIMIT: (ip: string, endpoint: string) => `rl:${ip}:${endpoint}`,
} as const;

export const CACHE_TTL = {
  USER_PROFILE: 60, // 1 minute
  FEED: 15, // 15 seconds (fast-moving)
  ACTIVE_STORIES: 60,
  SESSION: 60 * 60 * 24 * 30, // 30 days
} as const;
