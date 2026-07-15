import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../store";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { colors } from "../../lib/theme";

import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { usersApi } from "../../lib/api";

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          console.log("Failed to get permission for push notifications");
          return;
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!projectId || !isUuid.test(projectId)) {
          console.log(
            "Push notifications skipped in development: no valid eas.projectId found in app.json. Replace 'YOUR_EAS_PROJECT_ID' with a real EAS project ID to test push notifications."
          );
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Expo Push Token:", token);
        await usersApi.registerFcmToken(token);
      } catch (error) {
        console.log("Error registering push token:", error);
      }
    }

    if (isAuthenticated) {
      registerForPushNotificationsAsync();
    }
  }, [isAuthenticated]);

  // If not authenticated, redirect immediately back to welcome onboarding
  if (!isAuthenticated) {
    return <Redirect href="/auth/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
      <Stack.Screen name="user/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="story/[userId]" options={{ presentation: "fullScreenModal", animation: "fade" }} />
      <Stack.Screen name="story/create" options={{ presentation: "modal" }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="settings" options={{ presentation: "modal" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
