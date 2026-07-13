-- ahoj hand-crafted migration v0
-- Fixes PostGIS geography columns which Drizzle generates as quoted strings

-- Enable extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "public"."access_request_status" AS ENUM('PENDING','APPROVED','DENIED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."media_type" AS ENUM('IMAGE','VIDEO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."message_type" AS ENUM('TEXT','IMAGE','VIDEO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."privacy_mode" AS ENUM('PUBLIC','PRIVATE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."report_status" AS ENUM('PENDING','REVIEWED','DISMISSED','ACTION_TAKEN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username"         varchar(30) NOT NULL,
  "email"            text NOT NULL,
  "password_hash"    text NOT NULL,
  "profile_photo_url" text,
  "bio"              varchar(160),
  "website"          text,
  "social_links"     jsonb,
  "message"          varchar(60) NOT NULL,
  "privacy_mode"     privacy_mode DEFAULT 'PUBLIC' NOT NULL,
  "location"         geography(POINT, 4326),
  "date_of_birth"    timestamp NOT NULL,
  "is_verified"      boolean DEFAULT false,
  "is_banned"        boolean DEFAULT false,
  "warning_count"    integer DEFAULT 0,
  "fcm_token"        text,
  "last_active"      timestamp DEFAULT now(),
  "created_at"       timestamp DEFAULT now() NOT NULL,
  "updated_at"       timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_username_unique" UNIQUE("username"),
  CONSTRAINT "users_email_unique"    UNIQUE("email")
);
CREATE INDEX IF NOT EXISTS "idx_users_location"    ON "users" USING GIST("location");
CREATE INDEX IF NOT EXISTS "idx_users_last_active" ON "users" USING btree("last_active");

-- ─── refresh_tokens ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"    uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token"      text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);

-- ─── stories ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "stories" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"         uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "media_url"       text NOT NULL,
  "media_type"      media_type NOT NULL,
  "pinned_location" geography(POINT, 4326),
  "created_at"      timestamp DEFAULT now() NOT NULL,
  "expires_at"      timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_stories_user_id"   ON "stories" USING btree("user_id");
CREATE INDEX IF NOT EXISTS "idx_stories_expires_at" ON "stories" USING btree("expires_at");

-- ─── story_views ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "story_views" (
  "story_id"  uuid NOT NULL REFERENCES "stories"("id") ON DELETE CASCADE,
  "viewer_id" uuid NOT NULL REFERENCES "users"("id")   ON DELETE CASCADE,
  "viewed_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("story_id", "viewer_id")
);

-- ─── access_requests ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "access_requests" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "requester_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "target_id"    uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status"       access_request_status DEFAULT 'PENDING' NOT NULL,
  "created_at"   timestamp DEFAULT now() NOT NULL,
  "updated_at"   timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_access_requester_target"
  ON "access_requests" USING btree("requester_id","target_id");

-- ─── chats ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "chats" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at"      timestamp DEFAULT now() NOT NULL,
  "last_message_at" timestamp DEFAULT now()
);

-- ─── chat_participants ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "chat_participants" (
  "chat_id" uuid NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  PRIMARY KEY ("chat_id", "user_id")
);

-- ─── messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "messages" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_id"    uuid NOT NULL REFERENCES "chats"("id")   ON DELETE CASCADE,
  "sender_id"  uuid NOT NULL REFERENCES "users"("id"),
  "content"    text NOT NULL,
  "type"       message_type DEFAULT 'TEXT' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "read_at"    timestamp
);
CREATE INDEX IF NOT EXISTS "idx_messages_chat_id"    ON "messages" USING btree("chat_id");
CREATE INDEX IF NOT EXISTS "idx_messages_created_at" ON "messages" USING btree("created_at");

-- ─── blocks ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "blocks" (
  "blocker_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "blocked_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("blocker_id", "blocked_id")
);

-- ─── reports ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "reports" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reporter_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "target_id"   uuid NOT NULL,
  "target_type" text NOT NULL,
  "reason"      text NOT NULL,
  "status"      report_status DEFAULT 'PENDING' NOT NULL,
  "created_at"  timestamp DEFAULT now() NOT NULL
);
