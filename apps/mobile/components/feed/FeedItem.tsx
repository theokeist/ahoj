import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { StoryRing } from "./StoryRing";
import { colors, spacing, typography, radius } from "../../lib/theme";
import type { UserPublic } from "@ahoj/shared";

function formatDistance(meters: number): string {
  if (meters < 1000) return `~${meters} m`;
  return `~${(meters / 1000).toFixed(1)} km`;
}

export function FeedItem({ user, index }: { user: UserPublic; index: number }) {
  const isPrivate = user.privacyMode === "PRIVATE";

  return (
    <View>
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => router.push(`/(app)/user/${user.id}`)}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          onPress={() => {
            if (user.hasActiveStories) {
              router.push(`/(app)/story/${user.id}`);
            } else {
              router.push(`/(app)/user/${user.id}`);
            }
          }}
          activeOpacity={0.8}
          style={styles.avatarWrapper}
        >
          <StoryRing hasStories={user.hasActiveStories} />
          <View style={[styles.avatar, isPrivate && styles.avatarPrivate]}>
            {user.profilePhotoUrl && !isPrivate ? (
              <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" transition={200} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{user.username[0].toUpperCase()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.username}>{user.username}</Text>
            {isPrivate && (
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>🔒 Private</Text>
              </View>
            )}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {user.message}
          </Text>
        </View>

        <View style={styles.distanceContainer}>
          <Text style={styles.distance}>{formatDistance(user.distanceMeters)}</Text>
          {user.hasActiveStories && <View style={styles.storyDot} />}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  avatarWrapper: { position: "relative", alignItems: "center", justifyContent: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.background.card,
  },
  avatarPrivate: { opacity: 0.4 },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
  },
  avatarInitial: { fontSize: 22, fontWeight: typography.bold, color: colors.primary },
  userInfo: { flex: 1, gap: 2 },
  userHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  username: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.text.primary },
  privateBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  privateBadgeText: { fontSize: typography.xs, color: colors.text.tertiary },
  message: { fontSize: typography.sm, color: colors.text.secondary, lineHeight: 18 },
  distanceContainer: { alignItems: "flex-end", gap: 4 },
  distance: { fontSize: typography.xs, color: colors.text.tertiary, fontWeight: typography.medium },
  storyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
