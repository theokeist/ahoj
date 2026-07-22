import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../store";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { colors } from "../../lib/theme";

import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { usersApi } from "../../lib/api";

// Check if app is running inside Expo Go client (SDK 53+ removed remote push from Expo Go)
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure notification handler safely (only if not in Expo Go)
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      } as any),
    });
  } catch (err) {
    // Ignore notification handler error in Expo Go
  }
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      // Workaround: Skip remote push notifications in Expo Go SDK 53+ to prevent annoying error logs
      if (isExpoGo) {
        console.log("ℹ️ [Push Notifications] Skipped in Expo Go. Use EAS dev build or standalone app for remote push testing.");
        return;
      }

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
