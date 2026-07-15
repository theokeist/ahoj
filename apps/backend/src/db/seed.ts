import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { config } from "../config/env.js";
import { users, stories, chats, chatParticipants, messages } from "./schema.js";
import * as schema from "./schema.js";

const queryClient = postgres(config.DATABASE_URL, { max: 1 });
const db = drizzle(queryClient, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // 1. Create or update Dev User
  const existingDev = await db
    .select()
    .from(users)
    .where(eq(users.email, "dev@ahoj.app"))
    .limit(1);

  // Use default Brno coordinates for initial seed, or keep existing location if dev_user exists
  let centerLng = 16.6079;
  let centerLat = 49.1951;

  if (existingDev.length === 0) {
    await db.insert(users).values({
      username: "dev_user",
      email: "dev@ahoj.app",
      passwordHash,
      dateOfBirth: new Date("2000-01-01"),
      message: "Coding ahoj proximity network! 💻",
      location: sql`ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography`,
      lastActive: new Date(),
    });
    console.log("✅ Created dev_user (dev@ahoj.app)");
  } else {
    // Check if dev_user has a location, and if so, use it to seed nearby users
    const devLocation = await db.execute(sql`
      SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat 
      FROM users 
      WHERE email = 'dev@ahoj.app' AND location IS NOT NULL
      LIMIT 1
    `);
    const devLocRow = Array.isArray(devLocation) && devLocation.length > 0 ? devLocation[0] : null;
    if (devLocRow && devLocRow.lng && devLocRow.lat) {
      centerLng = parseFloat(String(devLocRow.lng));
      centerLat = parseFloat(String(devLocRow.lat));
      console.log(`📍 Found dev_user location in DB: ${centerLng}, ${centerLat}. Seeding nearby users around it.`);
    } else {
      console.log(`📍 No dev_user location in DB. Seeding nearby users around default coordinates: ${centerLng}, ${centerLat} (Brno).`);
    }

    await db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.email, "dev@ahoj.app"));
    console.log("✅ Updated dev_user lastActive to current time");
  }

  // 2. Create or update nearby users relative to dev_user location
  const nearbyUsers = [
    {
      username: "bob_nearby",
      email: "bob@ahoj.app",
      passwordHash,
      dateOfBirth: new Date("2002-05-12"),
      message: "Down for coffee? ☕",
      lngOffset: 0.0005,
      latOffset: 0.0005,
      privacyMode: "PUBLIC" as const,
    },
    {
      username: "alice_active",
      email: "alice@ahoj.app",
      passwordHash,
      dateOfBirth: new Date("2003-08-20"),
      message: "Chilling at the park 🏔️",
      lngOffset: -0.0008,
      latOffset: -0.0004,
      privacyMode: "PUBLIC" as const,
    },
    {
      username: "charlie_private",
      email: "charlie@ahoj.app",
      passwordHash,
      dateOfBirth: new Date("2001-11-05"),
      message: "Looking for concert buddies 🎸 [Locked]",
      lngOffset: 0.0007,
      latOffset: -0.0006,
      privacyMode: "PRIVATE" as const,
    },
  ];

  for (const u of nearbyUsers) {
    const userLng = centerLng + u.lngOffset;
    const userLat = centerLat + u.latOffset;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, u.email))
      .limit(1);

    const userValues = {
      username: u.username,
      email: u.email,
      passwordHash: u.passwordHash,
      dateOfBirth: u.dateOfBirth,
      message: u.message,
      location: sql`ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography`,
      privacyMode: u.privacyMode,
      lastActive: new Date(),
    };

    if (existing.length === 0) {
      await db.insert(users).values(userValues);
      console.log(`✅ Created nearby user: @${u.username} at ${userLng}, ${userLat}`);
    } else {
      await db
        .update(users)
        .set({
          location: userValues.location,
          lastActive: userValues.lastActive,
          message: userValues.message,
        })
        .where(eq(users.email, u.email));
      console.log(`✅ Updated nearby user location & lastActive: @${u.username} at ${userLng}, ${userLat}`);
    }
  }

  // 3. Create active stories for nearby users
  console.log("🎬 Creating dummy stories...");
  const devUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "dev@ahoj.app"))
    .limit(1)
    .then((r) => r[0]);
  const bob = await db
    .select()
    .from(users)
    .where(eq(users.username, "bob_nearby"))
    .limit(1)
    .then((r) => r[0]);
  const alice = await db
    .select()
    .from(users)
    .where(eq(users.username, "alice_active"))
    .limit(1)
    .then((r) => r[0]);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  if (bob) {
    const existingStories = await db.select().from(stories).where(eq(stories.userId, bob.id)).limit(1);
    if (existingStories.length === 0) {
      await db.insert(stories).values([
        {
          userId: bob.id,
          mediaUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600",
          mediaType: "IMAGE" as const,
          expiresAt: tomorrow,
        },
        {
          userId: bob.id,
          mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
          mediaType: "IMAGE" as const,
          expiresAt: tomorrow,
        }
      ]);
      console.log("✅ Created 2 active stories for @bob_nearby");
    } else {
      await db.update(stories).set({ expiresAt: tomorrow }).where(eq(stories.userId, bob.id));
      console.log("✅ Updated active stories expiration for @bob_nearby");
    }
  }

  if (alice) {
    const existingStories = await db.select().from(stories).where(eq(stories.userId, alice.id)).limit(1);
    if (existingStories.length === 0) {
      await db.insert(stories).values([
        {
          userId: alice.id,
          mediaUrl: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600",
          mediaType: "IMAGE" as const,
          expiresAt: tomorrow,
        }
      ]);
      console.log("✅ Created 1 active story for @alice_active");
    } else {
      await db.update(stories).set({ expiresAt: tomorrow }).where(eq(stories.userId, alice.id));
      console.log("✅ Updated active stories expiration for @alice_active");
    }
  }

  // 4. Create dummy chat and messages between dev_user and bob_nearby
  if (devUser && bob) {
    const existingChat = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, devUser.id))
      .limit(1);

    if (existingChat.length === 0) {
      const [newChat] = await db.insert(chats).values({}).returning();
      
      if (newChat) {
        await db.insert(chatParticipants).values([
          { chatId: newChat.id, userId: devUser.id },
          { chatId: newChat.id, userId: bob.id },
        ]);

        await db.insert(messages).values([
          {
            chatId: newChat.id,
            senderId: bob.id,
            content: "Hey dev! I see you are nearby. Let me know when the app is fully ready for testing!",
            createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 mins ago
          },
          {
            chatId: newChat.id,
            senderId: devUser.id,
            content: "Hey Bob! It is ready right now. I just finished seeding the chats!",
            createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 mins ago
          }
        ]);
        console.log("✅ Created a dummy chat conversation between @dev_user and @bob_nearby");
      }
    }
  }

  console.log("🌱 Seeding finished successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
