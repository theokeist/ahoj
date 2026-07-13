import { Tabs } from "expo-router";
import { colors, typography } from "../../../lib/theme";
import { Text, StyleSheet, Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: typography.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🌍</Text>,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
