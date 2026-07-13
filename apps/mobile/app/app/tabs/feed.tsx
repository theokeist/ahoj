import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useEffect, useCallback } from "react";
import { router } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Image } from "expo-image";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { feedApi } from "../../../lib/api";
import { useLocationStore } from "../../../store";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import type { UserPublic } from "@ahoj/shared";

function formatDistance(meters: number): string {
  if (meters < 1000) return `~${meters} m`;
  return `~${(meters / 1000).toFixed(1)} km`;
}

// ─── Story ring indicator ────────────────────────────────────────────────────

function StoryRing({ hasStories, size = 52 }: { hasStories: boolean; size?: number }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (hasStories) {
      rotation.value = withRepeat(withTiming(360, { duration: 4000 }), -1, false);
    }
  }, [hasStories]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!hasStories) {
    return (
      <View
        style={[
          styles.avatarRing,
          { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
          { borderColor: colors.borderLight },
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        animStyle,
        styles.avatarRingActive,
        { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
      ]}
    />
  );
}

// ─── Feed item ───────────────────────────────────────────────────────────────

function FeedItem({
  user,
  index,
}: {
  user: UserPublic;
  index: number;
}) {
  const isPrivate = user.privacyMode === "PRIVATE";

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => router.push(`/app/user/${user.id}`)}
        activeOpacity={0.8}
      >
        {/* Avatar with story ring */}
        <View style={styles.avatarWrapper}>
          <StoryRing hasStories={user.hasActiveStories} />
          <View style={[styles.avatar, isPrivate && styles.avatarPrivate]}>
            {user.profilePhotoUrl && !isPrivate ? (
              <Image
                source={{ uri: user.profilePhotoUrl }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user.username[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info */}
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

        {/* Distance */}
        <View style={styles.distanceContainer}>
          <Text style={styles.distance}>{formatDistance(user.distanceMeters)}</Text>
          {user.hasActiveStories && (
            <View style={styles.storyDot} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Feed Screen ────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { lat, lng, setLocation } = useLocationStore();

  // Request + watch location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Initial location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy ?? 0);

      // Watch for updates every 60s
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50, timeInterval: 60_000 },
        (loc) => setLocation(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy ?? 0)
      );
    })();

    return () => subscription?.remove();
  }, []);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed", lat, lng],
    queryFn: ({ pageParam }) =>
      feedApi.getProximityFeed({
        lat: lat!,
        lng: lng!,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: lat !== null && lng !== null,
  });

  const users = data?.pages.flatMap((p) => p.users) ?? [];

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🌍</Text>
      <Text style={styles.emptyTitle}>No one nearby</Text>
      <Text style={styles.emptyText}>
        No ahoj users within 2 km right now.{"\n"}Try expanding your radius or come back later!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  if (!lat || !lng) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>/A\</Text>
        <Text style={styles.headerTitle}>Nearby</Text>
        <TouchableOpacity onPress={() => router.push("/app/settings")}>
          <Text style={styles.headerIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <FeedItem user={item} index={index} />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={users.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  loadingText: { color: colors.text.secondary, fontSize: typography.base },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: -1,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  headerIcon: { fontSize: 22 },

  list: { paddingVertical: spacing.sm },
  emptyContainer: { flex: 1, justifyContent: "center" },

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
  avatarRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  avatarRingActive: {
    position: "absolute",
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
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

  empty: { alignItems: "center", padding: spacing.xl, gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text.primary },
  emptyText: { fontSize: typography.base, color: colors.text.secondary, textAlign: "center", lineHeight: 22 },

  loader: { padding: spacing.xl, alignItems: "center" },
});
