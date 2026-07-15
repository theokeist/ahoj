import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["users", "refresh_tokens", "stories", "access_requests", "chats", "chat_participants", "messages", "reports", "story_views", "blocks"],
  verbose: true,
  strict: true,
});
