import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Vibration,
  Animated,
  Easing,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useEffect, useCallback, useRef, useState } from "react";
import { router } from "expo-router";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { feedApi, usersApi, storiesApi } from "../../../lib/api";
import { StoriesBar } from "../../../components/feed/StoriesBar";

const splashImage = require("../../../assets/splash.png");
import { useLocationStore, useAuthStore, useSettingsStore } from "../../../store";
import { colors, spacing, typography, radius, getThemeAccentColor } from "../../../lib/theme";
import type { UserPublic } from "@ahoj/shared";

function formatDistance(meters: number): string {
  if (meters < 1000) return `~${meters} m`;
  return `~${(meters / 1000).toFixed(1)} km`;
}

// ─── Story ring indicator ────────────────────────────────────────────────────

function StoryRing({ hasStories, size = 52 }: { hasStories: boolean; size?: number }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasStories) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 360,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.setValue(0);
    }
  }, [hasStories]);

  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const animStyle = {
    transform: [{ rotate: spin }],
  };

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
    <View>
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => router.push(`/(app)/user/${user.id}`)}
        activeOpacity={0.8}
      >
        {/* Avatar with story ring */}
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
        </TouchableOpacity>

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
    </View>
  );
}

// ─── Main Feed Screen ────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { lat, lng, isGhostMode, setLocation, setGhostMode } = useLocationStore();
  const { showStoryBar, appTheme } = useSettingsStore();
  const insets = useSafeAreaInsets();
  const activeAccentColor = getThemeAccentColor(appTheme);

  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");

  const fabScale = useRef(new Animated.Value(isGhostMode ? 0.85 : 1)).current;
  const fabOpacity = useRef(new Animated.Value(isGhostMode ? 0.7 : 1)).current;

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

  // Sync location to backend (only if not in Ghost Mode)
  useEffect(() => {
    if (lat && lng && !isGhostMode) {
      usersApi.updateLocation(lat, lng).catch((err) => {
        console.warn("Failed to update location on backend:", err);
      });
    }
  }, [lat, lng, isGhostMode]);

  // Handle FAB animation when Ghost Mode state changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fabScale, {
        toValue: isGhostMode ? 0.85 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fabOpacity, {
        toValue: isGhostMode ? 0.7 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isGhostMode]);

  const fabAnimStyle = {
    transform: [{ scale: fabScale }],
    opacity: fabOpacity,
  };

  const toggleGhostMode = () => {
    Vibration.vibrate(100);
    setGhostMode(!isGhostMode);
  };

  const me = useAuthStore((s) => s.user);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [newMessage, setNewMessage] = useState(me?.message || "");
  const [isSavingMessage, setIsSavingMessage] = useState(false);

  useEffect(() => {
    if (me?.message) {
      setNewMessage(me.message);
    }
  }, [me?.message]);

  const { data: myStories = [], refetch: refetchMyStories } = useQuery({
    queryKey: ["my-stories", me?.id],
    queryFn: () => (me?.id ? storiesApi.getUserStories(me.id) : []),
    enabled: !!me?.id,
  });

  const handleRefresh = async () => {
    refetch();
    if (me?.id) {
      refetchMyStories();
    }
  };

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
  const hasLocation = lat !== null && lng !== null;
  const shouldShowInitialSplash = !hasLocation;
  const shouldShowDataLoading = isLoading && users.length === 0;
  const listContentStyle = users.length === 0
    ? [styles.emptyContainer, { paddingBottom: 96 + insets.bottom }]
    : [styles.list, { paddingBottom: 96 + insets.bottom }];

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

  if (shouldShowInitialSplash) {
    return (
      <View style={styles.loadingScreen}>
        <Image source={splashImage} style={styles.loadingSplash} contentFit="contain" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 + insets.top }]}> 
        <TouchableOpacity onPress={() => router.push("/(app)/story/create")}>
          <Text style={styles.headerIcon}>➕</Text>
        </TouchableOpacity>
        
        {/* Mode Selector Segment */}
        <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", padding: 3, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
          <TouchableOpacity
            onPress={() => setViewMode("grid")}
            style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9, backgroundColor: viewMode === "grid" ? activeAccentColor : "transparent" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: viewMode === "grid" ? "#000" : "#FFF" }}>📜 Stream</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("radar")}
            style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9, backgroundColor: viewMode === "radar" ? activeAccentColor : "transparent" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: viewMode === "radar" ? "#000" : "#FFF" }}>📡 Radar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setIsProfileMenuOpen(true)}>
          <View style={styles.headerAvatarWrapper}>
            {me?.profilePhotoUrl ? (
              <Image source={{ uri: me.profilePhotoUrl }} style={styles.headerAvatar} contentFit="cover" />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                <Text style={styles.headerAvatarText}>
                  {me?.username ? me.username[0].toUpperCase() : "M"}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Ghost Mode Active Banner */}
      {isGhostMode && (
        <Reanimated.View entering={FadeInDown} style={styles.ghostBanner}>
          <Text style={styles.ghostBannerText}>👻 Ghost Mode Active — You are hidden</Text>
        </Reanimated.View>
      )}

      {shouldShowDataLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={activeAccentColor} />
        </View>
      ) : viewMode === "radar" ? (
        /* Full-Size Interactive Circular Mobile Radar Map */
        <View style={{ flex: 1, margin: 12, borderRadius: 24, backgroundColor: "#070B0E", borderWidth: 1, borderColor: activeAccentColor + "40", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
          {/* Concentric Distance Rings */}
          <View style={{ position: "absolute", width: "90%", height: "90%", borderRadius: 999, borderWidth: 1, borderColor: activeAccentColor + "20", alignItems: "center", justifyContent: "flex-start" }}>
            <Text style={{ fontSize: 9, color: activeAccentColor, fontWeight: "700", marginTop: 4, backgroundColor: "#000", paddingHorizontal: 6, borderRadius: 6 }}>1km Orbit</Text>
          </View>
          <View style={{ position: "absolute", width: "66%", height: "66%", borderRadius: 999, borderWidth: 1, borderColor: activeAccentColor + "35", alignItems: "center", justifyContent: "flex-start" }}>
            <Text style={{ fontSize: 9, color: activeAccentColor, fontWeight: "700", marginTop: 4, backgroundColor: "#000", paddingHorizontal: 6, borderRadius: 6 }}>500m Orbit</Text>
          </View>
          <View style={{ position: "absolute", width: "42%", height: "42%", borderRadius: 999, borderWidth: 1, borderColor: activeAccentColor + "50", alignItems: "center", justifyContent: "flex-start" }}>
            <Text style={{ fontSize: 9, color: activeAccentColor, fontWeight: "700", marginTop: 4, backgroundColor: "#000", paddingHorizontal: 6, borderRadius: 6 }}>100m Inner</Text>
          </View>
          
          {/* Axis Crosshairs */}
          <View style={{ position: "absolute", left: 0, right: 0, height: 1, backgroundColor: activeAccentColor + "25" }} />
          <View style={{ position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: activeAccentColor + "25" }} />

          {/* Center Self Node */}
          <TouchableOpacity
            onPress={() => setIsProfileMenuOpen(true)}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: activeAccentColor, alignItems: "center", justifyContent: "center", zIndex: 10, shadowColor: activeAccentColor, shadowRadius: 12, shadowOpacity: 0.8 }}
          >
            <Text style={{ fontSize: 13, fontWeight: "900", color: "#000" }}>/A\</Text>
            <Text style={{ fontSize: 8, fontWeight: "900", color: "#000" }}>YOU</Text>
          </TouchableOpacity>

          {/* Nearby User Blips */}
          {users.map((u, idx) => {
            const angles = [40, 130, 215, 310, 70, 255, 165, 295];
            const distances = [120, 145, 155, 95, 130, 115, 100, 150];
            const angle = angles[idx % angles.length];
            const dist = distances[idx % distances.length];
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * dist;
            const y = Math.sin(rad) * dist;

            return (
              <TouchableOpacity
                key={u.id}
                onPress={() => router.push({ pathname: "/(app)/user/[id]", params: { id: u.id } })}
                style={{ position: "absolute", transform: [{ translateX: x }, { translateY: y }], alignItems: "center", zIndex: 20 }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: activeAccentColor, overflow: "hidden", backgroundColor: "#121212" }}>
                  {u.profilePhotoUrl ? (
                    <Image source={{ uri: u.profilePhotoUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  ) : (
                    <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: activeAccentColor + "30" }}>
                      <Text style={{ color: activeAccentColor, fontWeight: "800", fontSize: 12 }}>{u.username[0].toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <View style={{ marginTop: 2, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#FFF" }}>@{u.username}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.feedContent}>
          {showStoryBar && <StoriesBar myStories={myStories} nearbyUsers={users} me={me} />}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <FeedItem user={item} index={index} />
            )}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={listContentStyle}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor={activeAccentColor}
              />
            }
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Ghost Mode FAB */}
      <Animated.View style={[styles.fabContainer, fabAnimStyle]}>
        <TouchableOpacity
          style={[styles.fab, isGhostMode ? styles.fabActive : styles.fabInactive]}
          onPress={toggleGhostMode}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>👻</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Quick Profile Menu Modal */}
      <Modal
        visible={isProfileMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsProfileMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsProfileMenuOpen(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatarWrapper}>
                {me?.profilePhotoUrl ? (
                  <Image source={{ uri: me.profilePhotoUrl }} style={styles.modalAvatar} contentFit="cover" />
                ) : (
                  <View style={[styles.modalAvatar, styles.modalAvatarPlaceholder]}>
                    <Text style={styles.modalAvatarText}>
                      {me?.username ? me.username[0].toUpperCase() : "M"}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.modalUsername}>@{me?.username}</Text>
            </View>

            {/* Icebreaker Message Quick Edit */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Rychlý vzkaz (Icebreaker)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.modalInput}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Napište vzkaz pro lidi v okolí..."
                  placeholderTextColor={colors.text.tertiary}
                  maxLength={60}
                />
                <TouchableOpacity
                  style={[styles.saveMessageBtn, isSavingMessage && styles.btnDisabled]}
                  onPress={async () => {
                    if (isSavingMessage) return;
                    setIsSavingMessage(true);
                    try {
                      const res = await usersApi.updateMessage(newMessage);
                      // Update Zustand Store
                      const accessToken = useAuthStore.getState().accessToken;
                      const refreshToken = useAuthStore.getState().refreshToken;
                      if (me && accessToken && refreshToken) {
                        useAuthStore.getState().setAuth({ ...me, message: res.message }, accessToken, refreshToken);
                      }
                      Alert.alert("Úspěch", "Vzkaz byl aktualizován!");
                    } catch (err: any) {
                      Alert.alert("Chyba", err?.response?.data?.error ?? "Nepodařilo se uložit vzkaz.");
                    } finally {
                      setIsSavingMessage(false);
                    }
                  }}
                  disabled={isSavingMessage}
                >
                  {isSavingMessage ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveMessageBtnText}>Uložit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions list */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionRow}
                onPress={() => {
                  setIsProfileMenuOpen(false);
                  if (myStories.length > 0) {
                    router.push(`/(app)/story/${me?.id}`);
                  } else {
                    router.push(`/(app)/story/create`);
                  }
                }}
              >
                <Text style={styles.modalActionIcon}>📸</Text>
                <Text style={styles.modalActionText}>
                  {myStories.length > 0 ? "Přehrát mé Story" : "Přidat nové Story"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionRow}
                onPress={() => {
                  setIsProfileMenuOpen(false);
                  router.push("/(app)/tabs/profile");
                }}
              >
                <Text style={styles.modalActionIcon}>👤</Text>
                <Text style={styles.modalActionText}>Přejít na můj profil</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsProfileMenuOpen(false)}>
              <Text style={styles.modalCloseBtnText}>Zavřít</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
  },
  loadingSplash: { width: 220, height: 220 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 12,
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

  feedContent: { flex: 1 },
  list: { paddingVertical: spacing.sm },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },

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
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },

  ghostBanner: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 107, 107, 0.25)",
  },
  ghostBannerText: {
    color: colors.accent,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: colors.accent,
  },
  fabInactive: {
    backgroundColor: colors.primary,
  },
  fabIcon: {
    fontSize: 24,
  },
  storiesBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  storiesScroll: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  storyBubble: {
    alignItems: "center",
    gap: spacing.sm,
    width: 94,
  },
  storyBubbleLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
    width: "100%",
    lineHeight: 13,
  },
  plusBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.background.primary,
    zIndex: 20,
  },
  plusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    lineHeight: 13,
  },
  myAvatar: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  headerAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
  },
  headerAvatarPlaceholder: {
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  modalAvatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  modalAvatar: {
    width: "100%",
    height: "100%",
  },
  modalAvatarPlaceholder: {
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
  },
  modalAvatarText: {
    fontSize: 20,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  modalUsername: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  modalSection: {
    gap: spacing.xs,
  },
  modalLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.base,
    color: colors.text.primary,
  },
  saveMessageBtn: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  saveMessageBtnText: {
    color: "#fff",
    fontWeight: typography.semibold,
    fontSize: typography.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalActions: {
    gap: spacing.sm,
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalActionIcon: {
    fontSize: 20,
  },
  modalActionText: {
    fontSize: typography.base,
    color: colors.text.primary,
    fontWeight: typography.medium,
  },
  modalCloseBtn: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  modalCloseBtnText: {
    color: colors.text.secondary,
    fontWeight: typography.semibold,
    fontSize: typography.base,
  },
});
