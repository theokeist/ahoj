import { Tabs } from "expo-router";
import { colors, typography } from "../../../lib/theme";
import { Text, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const isSmallDevice = screenHeight <= 700 || screenWidth <= 360;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const baseHeight = isIOS ? 72 : 68;
  const tabBarHeight = baseHeight + Math.max(insets.bottom, 8);
  const tabBarPaddingBottom = Math.max(10, insets.bottom > 0 ? insets.bottom - 2 : 10);
  const tabBarPaddingTop = isSmallDevice ? 8 : 10;
  const iconSize = isIOS ? 22 : 20;
  const labelSize = isSmallDevice ? 11 : 12;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: tabBarPaddingTop,
          paddingHorizontal: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: labelSize,
          fontWeight: typography.semibold,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          minHeight: 56,
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: iconSize }}>🌍</Text>,
        }}
      />
      <Tabs.Screen
        name="sparks"
        options={{
          title: "Sparks",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: iconSize }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: iconSize }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: iconSize }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
