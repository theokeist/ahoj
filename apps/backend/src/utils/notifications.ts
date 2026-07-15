import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  const [user] = await db
    .select({ fcmToken: users.fcmToken })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.fcmToken) {
    console.log(`[Push] User ${userId} has no registered push token.`);
    return;
  }

  // Verify it is an Expo Push Token
  if (!user.fcmToken.startsWith("ExponentPushToken[")) {
    console.log(`[Push] Token for ${userId} is not a valid Expo token: ${user.fcmToken}`);
    return;
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: user.fcmToken,
        sound: "default",
        title,
        body,
        data,
      }),
    });

    const resData = await response.json();
    console.log(`[Push] Expo push notification response:`, JSON.stringify(resData));
  } catch (error) {
    console.error(`[Push] Error sending notification to user ${userId}:`, error);
  }
}
