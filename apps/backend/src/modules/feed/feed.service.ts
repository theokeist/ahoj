import { sql } from "drizzle-orm";
import type { DB } from "../../db/index.js";
import type { UserPublic } from "@ahoj/shared";

/**
 * Proximity feed query using PostGIS ST_DWithin + ST_Distance.
 * Returns users within `radiusKm` km sorted by distance ascending,
 * excluding blocked users and the requesting user.
 *
 * Privacy: private users have profilePhotoUrl set to null (blurred on client).
 * Location: only distance in meters is returned — never raw coordinates.
 */
export async function getProximityFeed(
  db: DB,
  params: {
    requesterId: string;
    lat: number;
    lng: number;
    radiusKm: number;
    limit: number;
    cursor?: string; // last seen distance in meters (for cursor pagination)
  }
): Promise<UserPublic[]> {
  const radiusMeters = params.radiusKm * 1000;

  const result = await db.execute(sql`
    WITH blocked AS (
      SELECT blocker_id, blocked_id FROM blocks
      WHERE blocker_id = ${params.requesterId}
         OR blocked_id = ${params.requesterId}
    ),
    active_stories AS (
      SELECT DISTINCT user_id FROM stories
      WHERE expires_at > NOW()
    )
    SELECT
      u.id,
      u.username,
      -- Show photo if public OR if access is approved
      CASE 
        WHEN u.privacy_mode = 'PUBLIC' OR ar.status = 'APPROVED' THEN u.profile_photo_url 
        ELSE NULL 
      END AS profile_photo_url,
      -- Show bio if public OR if access is approved
      CASE 
        WHEN u.privacy_mode = 'PUBLIC' OR ar.status = 'APPROVED' THEN u.bio 
        ELSE NULL 
      END AS bio,
      u.message,
      u.privacy_mode,
      -- Distance in meters, rounded to 10m for privacy fuzzing
      ROUND(
        ST_Distance(
          u.location::geography,
          ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography
        ) / 10
      ) * 10 AS distance_meters,
      (s.user_id IS NOT NULL) AS has_active_stories,
      u.last_active,
      ar.status AS access_status
    FROM users u
    LEFT JOIN active_stories s ON s.user_id = u.id
    LEFT JOIN access_requests ar ON ar.requester_id = ${params.requesterId} AND ar.target_id = u.id
    WHERE
      u.id != ${params.requesterId}
      AND u.is_banned = false
      AND u.location IS NOT NULL
      AND u.last_active > NOW() - INTERVAL '2 hours'
      AND ST_DWithin(
        u.location::geography,
        ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography,
        ${radiusMeters}
      )
      AND u.id NOT IN (
        SELECT blocker_id FROM blocked WHERE blocked_id = ${params.requesterId}
        UNION
        SELECT blocked_id FROM blocked WHERE blocker_id = ${params.requesterId}
      )
      ${params.cursor ? sql`AND ROUND(ST_Distance(u.location::geography, ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography) / 10) * 10 > ${parseInt(params.cursor)}` : sql``}
    ORDER BY distance_meters ASC, u.last_active DESC
    LIMIT ${params.limit}
  `);

  const rows: Record<string, unknown>[] = Array.isArray(result)
    ? (result as Record<string, unknown>[])
    : [];

  return rows.map((row) => ({
    id: row.id as string,
    username: row.username as string,
    profilePhotoUrl: row.profile_photo_url as string | null,
    bio: row.bio as string | null,
    message: row.message as string,
    privacyMode: row.privacy_mode as "PUBLIC" | "PRIVATE",
    distanceMeters: parseInt(String(row.distance_meters)),
    hasActiveStories: Boolean(row.has_active_stories),
    lastActive: row.last_active instanceof Date
      ? row.last_active.toISOString()
      : typeof row.last_active === "string"
      ? new Date(row.last_active).toISOString()
      : new Date().toISOString(),
    accessStatus: (row.access_status as "PENDING" | "APPROVED" | "REJECTED" | null) ?? null,
  }));
}
