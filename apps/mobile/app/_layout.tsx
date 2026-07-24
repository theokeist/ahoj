import { useCallback } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, StyleSheet, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "../lib/theme";

// Safely load BootSplash without throwing TurboModuleRegistry error in Expo Go / Web
let BootSplash: typeof import("react-native-bootsplash").default | null = null;
try {
  BootSplash = require("react-native-bootsplash").default;
} catch {
  // Native module RNBootSplash not available in Expo Go or Web environment
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000, // 30s
      gcTime: 5 * 60 * 1000, // 5 min
    },
  },
});

export default function RootLayout() {
  const onLayoutRootView = useCallback(async () => {
    if (Platform.OS !== "web" && BootSplash) {
      try {
        await BootSplash.hide({ fade: true });
      } catch {
        // Fallback catch
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <StatusBar style="light" backgroundColor={colors.background.primary} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background.primary },
              animation: "fade",
            }}
          />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.primary },
});
