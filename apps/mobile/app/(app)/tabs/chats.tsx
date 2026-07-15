import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chatsApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import { pageStyles } from "../../../lib/pageStyles";

type ChatListItem = {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  partner: { id: string; username: string; profilePhotoUrl: string | null; privacyMode: "PUBLIC" | "PRIVATE" } | null;
  lastMessage: { content: string; type: string } | null;
};

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { data: chats, isLoading, refetch } = useQuery<ChatListItem[]>({
    queryKey: ["chats"],
    queryFn: chatsApi.getChats,
  });

  const notificationChat: ChatListItem = {
    id: "ahoj-notification",
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    partner: {
      id: "ahoj",
      username: "Ahoj",
      profilePhotoUrl: null,
      privacyMode: "PUBLIC",
    },
    lastMessage: {
      content: "New nearby activity and story updates",
      type: "notification",
    },
  };

  const displayChats = [notificationChat, ...(chats || [])];

  const renderItem = ({ item }: { item: ChatListItem }) => {
    const isNotification = item.id === notificationChat.id;

    return (
      <TouchableOpacity
        style={[styles.chatItem, isNotification && styles.notificationChatItem]}
        onPress={() => router.push(`/(app)/chat/${item.id}`)}
      >
        <View style={[styles.avatar, isNotification && styles.notificationAvatar]}>
          {item.partner?.profilePhotoUrl ? (
            <Image
              source={{ uri: item.partner.profilePhotoUrl }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={[styles.avatarText, isNotification && styles.notificationAvatarText]}>
              {item.partner?.username?.[0]?.toUpperCase() || "A"}
            </Text>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>
            {item.partner?.username ? `@${item.partner.username}` : "Unknown User"}
          </Text>
          <Text style={[styles.lastMessage, isNotification && styles.notificationText]} numberOfLines={1}>
            {item.lastMessage ? item.lastMessage.content : "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
<View style={pageStyles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={[pageStyles.header, { paddingTop: 12 + insets.top }]}> 
        <Text style={pageStyles.headerTitle}>Chats</Text>
      </View>

      {isLoading ? (
        <View style={pageStyles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={displayChats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                When you connect with someone nearby, your chats will appear here.
              </Text>
            </View>
          }
          contentContainerStyle={[styles.list, { paddingBottom: 88 + insets.bottom }]}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: spacing.sm },
  chatItem: {
    flexDirection: "row",
    padding: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  notificationChatItem: {
    backgroundColor: colors.background.secondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: { fontSize: 20, fontWeight: typography.bold, color: colors.text.primary },
  notificationAvatar: {
    backgroundColor: colors.primary,
  },
  notificationAvatarText: {
    color: "#fff",
  },
  chatInfo: { flex: 1, gap: 4 },
  chatName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.primary,
  },
  lastMessage: {
    fontSize: typography.sm,
    color: colors.text.secondary,
  },
  notificationText: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  empty: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: 80,
    gap: spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
