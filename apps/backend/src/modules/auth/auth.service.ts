import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { differenceInYears } from "date-fns";

import { db } from "../../db/index.js";
import { users, refreshTokens } from "../../db/schema.js";
import { config } from "../../config/env.js";
import { AHOJ_CONSTANTS } from "@ahoj/shared";

const ACCESS_SECRET = new TextEncoder().encode(config.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(config.JWT_REFRESH_SECRET);

// ─── Token utilities ─────────────────────────────────────────────────────────

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.JWT_ACCESS_EXPIRES_IN)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.JWT_REFRESH_EXPIRES_IN)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload;
}

// ─── Service functions ───────────────────────────────────────────────────────

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
}) {
  // Age verification — must be 16+
  const age = differenceInYears(new Date(), new Date(input.dateOfBirth));
  if (age < AHOJ_CONSTANTS.MIN_AGE) {
    throw new Error(`UNDERAGE: ahoj is for users aged ${AHOJ_CONSTANTS.MIN_AGE}+`);
  }

  // Check uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("EMAIL_TAKEN: Email already in use");
  }

  const existingUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, input.username))
    .limit(1);

  if (existingUsername.length > 0) {
    throw new Error("USERNAME_TAKEN: Username already taken");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user with default message
  const [user] = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      passwordHash,
      dateOfBirth: new Date(input.dateOfBirth),
      message: `Hey, I'm ${input.username} 👋`,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      message: users.message,
      privacyMode: users.privacyMode,
      createdAt: users.createdAt,
    });

  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.isBanned) {
    throw new Error("ACCOUNT_BANNED");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
}

export async function saveRefreshToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.insert(refreshTokens).values({ userId, token, expiresAt });
}

export async function revokeRefreshToken(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}
