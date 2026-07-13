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
import { chatsApi } from "../../../lib/api";
import { colors, spacing, typography } from "../../../lib/theme";

export default function ChatsScreen() {
  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ["chats"],
    queryFn: chatsApi.getChats,
  });

  const renderItem = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => AlertPlaceholder()}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>Chat Thread</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            Tap to open conversation
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const AlertPlaceholder = () => {
    // Will be fully linked up in Phase 2
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={chats || []}
          keyExtractor={(item) => item}
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
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20 },
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
