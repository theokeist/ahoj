import { sql } from "drizzle-orm";
import { db } from "./index.js";

/**
 * Auto-ensures all database tables and column constraints match the latest Drizzle schema
 * (idempotent, safe to run on every startup).
 */
export async function ensureDbSchema() {
  try {
    // 1. Drop NOT NULL constraints on users table for OAuth signups
    await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "date_of_birth" DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;`);

    // 2. Create spark_category enum if missing
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."spark_category" AS ENUM('COFFEE','SPORTS','PARTY','STUDY','MEETUP','OTHER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 3. Ensure sparks table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sparks" (
        "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id"     uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title"       varchar(60) NOT NULL,
        "description" text,
        "category"    spark_category DEFAULT 'MEETUP' NOT NULL,
        "location"    geography(POINT, 4326) NOT NULL,
        "expires_at"  timestamp NOT NULL,
        "created_at"  timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "idx_sparks_location"   ON "sparks" USING GIST("location");
      CREATE INDEX IF NOT EXISTS "idx_sparks_expires_at" ON "sparks" USING btree("expires_at");
    `);

    // 4. Ensure user_settings table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_settings" (
        "user_id"                  uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
        "privacy_mode"             privacy_mode DEFAULT 'PUBLIC' NOT NULL,
        "ghost_fuzz_radius_meters" integer DEFAULT 300 NOT NULL,
        "allow_direct_messages"   varchar(20) DEFAULT 'EVERYONE' NOT NULL,
        "show_distance_to_others"  boolean DEFAULT true NOT NULL,
        "notifications"            jsonb DEFAULT '{"pushEnabled":true,"nearbyUsersAlert":true,"sparksAlert":true,"messagesAlert":true,"accessRequestAlert":true,"soundEnabled":true}'::jsonb NOT NULL,
        "language"                 varchar(10) DEFAULT 'cs' NOT NULL,
        "distance_unit"            varchar(10) DEFAULT 'metric' NOT NULL,
        "auto_play_videos"         varchar(20) DEFAULT 'wifi' NOT NULL,
        "media_upload_quality"     varchar(20) DEFAULT 'high' NOT NULL,
        "updated_at"               timestamp DEFAULT now() NOT NULL
      );
    `);

    // 5. Ensure oauth_connections table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "oauth_connections" (
        "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id"          uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider"         text NOT NULL,
        "provider_user_id" text NOT NULL,
        "created_at"       timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "oauth_connections_provider_user_unique" UNIQUE("provider", "provider_user_id")
      );
    `);

    // 6. Ensure blocks table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blocks" (
        "blocker_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "blocked_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" timestamp DEFAULT now() NOT NULL,
        PRIMARY KEY ("blocker_id", "blocked_id")
      );
    `);

    // 7. Ensure reports table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "reporter_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "target_id"   uuid NOT NULL,
        "target_type" text NOT NULL,
        "reason"      text NOT NULL,
        "status"      report_status DEFAULT 'PENDING' NOT NULL,
        "created_at"  timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("✅ DB schema verification complete (sparks, user_settings, oauth_connections ready)");
  } catch (err) {
    console.error("⚠️ DB schema auto-sync notice:", err instanceof Error ? err.message : String(err));
  }
}
