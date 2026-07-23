import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { differenceInYears } from "date-fns";

import { db } from "../../db/index.js";
import { users, refreshTokens, oauthConnections } from "../../db/schema.js";
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
  dateOfBirth?: string;
}) {
  // Age verification — if provided, must be 16+
  if (input.dateOfBirth) {
    const age = differenceInYears(new Date(), new Date(input.dateOfBirth));
    if (age < AHOJ_CONSTANTS.MIN_AGE) {
      throw new Error(`UNDERAGE: ahoj is for users aged ${AHOJ_CONSTANTS.MIN_AGE}+`);
    }
  }

  // Check email uniqueness
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
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      message: `Hey, I'm ${input.username} 👋`,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      message: users.message,
      privacyMode: users.privacyMode,
      profilePhotoUrl: users.profilePhotoUrl,
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

  if (!user || !user.passwordHash) {
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

export async function loginOrRegisterOAuthUser(input: {
  provider: string;
  providerUserId: string;
  email?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}) {
  // 1. Check existing OAuth connection
  const [existingConnection] = await db
    .select()
    .from(oauthConnections)
    .where(
      and(
        eq(oauthConnections.provider, input.provider),
        eq(oauthConnections.providerUserId, input.providerUserId)
      )
    )
    .limit(1);

  if (existingConnection) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, existingConnection.userId))
      .limit(1);

    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.isBanned) throw new Error("ACCOUNT_BANNED");

    // Update avatar/bio if provided and missing
    if ((input.avatarUrl && !user.profilePhotoUrl) || (input.bio && !user.bio)) {
      await db
        .update(users)
        .set({
          profilePhotoUrl: user.profilePhotoUrl || input.avatarUrl,
          bio: user.bio || input.bio,
        })
        .where(eq(users.id, user.id));
    }

    return user;
  }

  // 2. Check if user exists by email (if email is provided)
  if (input.email) {
    const [existingUserByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUserByEmail) {
      if (existingUserByEmail.isBanned) throw new Error("ACCOUNT_BANNED");

      // Link OAuth connection
      await db.insert(oauthConnections).values({
        userId: existingUserByEmail.id,
        provider: input.provider,
        providerUserId: input.providerUserId,
      });

      return existingUserByEmail;
    }
  }

  // 3. Create new user for OAuth
  let targetUsername = input.username || (input.email ? input.email.split("@")[0] : `user_${Math.floor(1000 + Math.random() * 9000)}`);
  targetUsername = targetUsername.replace(/[^a-zA-Z0-9_]/g, "");
  if (targetUsername.length < 3) targetUsername = `user_${Math.floor(1000 + Math.random() * 9000)}`;

  // Ensure unique username
  const [takenUsername] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, targetUsername))
    .limit(1);

  if (takenUsername) {
    targetUsername = `${targetUsername}_${Math.floor(100 + Math.random() * 900)}`;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      username: targetUsername,
      email: input.email || null,
      passwordHash: "OAUTH_USER_NO_PASSWORD",
      profilePhotoUrl: input.avatarUrl || null,
      bio: input.bio || null,
      message: `Hey, I'm ${targetUsername} 👋`,
    })
    .returning();

  // Create OAuth connection link
  await db.insert(oauthConnections).values({
    userId: newUser.id,
    provider: input.provider,
    providerUserId: input.providerUserId,
  });

  return newUser;
}

export async function saveRefreshToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.insert(refreshTokens).values({ userId, token, expiresAt });
}

export async function revokeRefreshToken(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}
