import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../store";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { colors } from "../../lib/theme";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
