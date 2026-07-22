import { sql } from "drizzle-orm";
import type { DB } from "../../db/index.js";
import type { SparkPublic } from "@ahoj/shared";

export async function createSpark(
  db: DB,
  input: {
    userId: string;
    title: string;
    description?: string;
    category: "COFFEE" | "SPORTS" | "PARTY" | "STUDY" | "MEETUP" | "OTHER";
    lat: number;
    lng: number;
  }
): Promise<SparkPublic> {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  const result = await db.execute(sql`
    INSERT INTO sparks (
      user_id,
      title,
      description,
      category,
      location,
      expires_at
    )
    VALUES (
      ${input.userId},
      ${input.title},
      ${input.description || null},
      ${input.category},
      ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography,
      ${expiresAt.toISOString()}
    )
    RETURNING id, created_at, expires_at
  `);

  const rows = Array.isArray(result) ? (result as Record<string, unknown>[]) : [];
  const sparkId = rows[0]?.id as string;
  const createdAt = rows[0]?.created_at as Date;

  // Get user details
  const userResult = await db.execute(sql`
    SELECT username, profile_photo_url FROM users WHERE id = ${input.userId}
  `);
  const userRows = Array.isArray(userResult) ? (userResult as Record<string, unknown>[]) : [];
  const username = (userRows[0]?.username as string) || "Anonymous";
  const userAvatarUrl = (userRows[0]?.profile_photo_url as string) || null;

  return {
    id: sparkId,
    userId: input.userId,
    username,
    userAvatarUrl,
    title: input.title,
    description: input.description || null,
    category: input.category,
    lat: input.lat,
    lng: input.lng,
    distanceMeters: 0,
    createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function getNearbySparks(
  db: DB,
  params: {
    lat: number;
    lng: number;
    radiusKm: number;
  }
): Promise<SparkPublic[]> {
  const radiusMeters = params.radiusKm * 1000;

  const result = await db.execute(sql`
    SELECT
      s.id,
      s.user_id,
      u.username,
      u.profile_photo_url AS user_avatar_url,
      s.title,
      s.description,
      s.category,
      ST_Y(s.location::geometry) AS lat,
      ST_X(s.location::geometry) AS lng,
      ROUND(
        ST_Distance(
          s.location::geography,
          ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography
        )
      ) AS distance_meters,
      s.created_at,
      s.expires_at
    FROM sparks s
    JOIN users u ON u.id = s.user_id
    WHERE
      s.expires_at > NOW()
      AND ST_DWithin(
        s.location::geography,
        ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography,
        ${radiusMeters}
      )
    ORDER BY s.created_at DESC
    LIMIT 50
  `);

  const rows: Record<string, unknown>[] = Array.isArray(result)
    ? (result as Record<string, unknown>[])
    : [];

  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    username: row.username as string,
    userAvatarUrl: (row.user_avatar_url as string) || null,
    title: row.title as string,
    description: (row.description as string) || null,
    category: row.category as "COFFEE" | "SPORTS" | "PARTY" | "STUDY" | "MEETUP" | "OTHER",
    lat: parseFloat(String(row.lat)),
    lng: parseFloat(String(row.lng)),
    distanceMeters: parseInt(String(row.distance_meters || 0)),
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(String(row.created_at)).toISOString(),
    expiresAt: row.expires_at instanceof Date
      ? row.expires_at.toISOString()
      : new Date(String(row.expires_at)).toISOString(),
  }));
}

export async function deleteSpark(db: DB, sparkId: string, userId: string): Promise<boolean> {
  const result = await db.execute(sql`
    DELETE FROM sparks WHERE id = ${sparkId} AND user_id = ${userId}
  `);
  return true;
}
