import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Image } from "expo-image";
import { storiesApi, usersApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [currentIdx, setCurrentIdx] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const currentProgress = useRef(0);
  const progressListener = useRef<string | null>(null);

  useEffect(() => {
    progressListener.current = progress.addListener(({ value }) => {
      currentProgress.current = value;
    });
    return () => {
      if (progressListener.current) {
        progress.removeListener(progressListener.current);
      }
    };
  }, []);

  // Fetch target user's public info
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getUser(userId),
  });

  // Fetch active stories
  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories", userId],
    queryFn: () => storiesApi.getUserStories(userId),
  });

  // Mutation to mark story as viewed
  const viewStoryMutation = useMutation({
    mutationFn: (storyId: string) => storiesApi.markViewed(storyId),
  });

  useEffect(() => {
    if (stories && stories[currentIdx]) {
      viewStoryMutation.mutate(stories[currentIdx].id);

      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: STORY_DURATION,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });
    }
    return () => {
      progress.stopAnimation();
    };
  }, [stories, currentIdx]);

  const handleNext = () => {
    if (!stories) return;
    if (currentIdx < stories.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handlePress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handlePressIn = () => {
    progress.stopAnimation();
  };

  const handlePressOut = () => {
    const remainingTime = STORY_DURATION * (1 - currentProgress.current);
    Animated.timing(progress, {
      toValue: 1,
      duration: remainingTime,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });
  };

  const getProgressStyle = (idx: number) => {
    if (idx < currentIdx) return { width: "100%" };
    if (idx > currentIdx) return { width: "0%" };
    return {
      width: progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"]
      })
    };
  };

  if (isLoading || !stories) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff", fontSize: 16 }}>No active stories</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStory = stories[currentIdx];

  const getOverlayConfig = (url: string) => {
    try {
      const parts = url.split("?");
      if (parts.length < 2) return null;
      const params: Record<string, string> = {};
      const pairs = parts[1].split("&");
      for (const pair of pairs) {
        const [k, v] = pair.split("=");
        if (k && v) {
          params[k] = decodeURIComponent(v);
        }
      }
      return {
        filter: params.filter || null,
        text: params.text || null,
        textColor: params.textColor || "#FFFFFF",
        fontSize: params.fontSize ? parseInt(params.fontSize) : 22,
        banner: params.banner || "glass",
        sticker: params.sticker || params.emoji || null,
      };
    } catch {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableWithoutFeedback
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.storyWrapper}>
          {currentStory && (
            <Image
              source={{ uri: currentStory.mediaUrl }}
              style={styles.storyImage}
              contentFit="cover"
            />
          )}

          {/* Render filters, sticker overlays, and styled text banner */}
          {(() => {
            if (!currentStory) return null;
            const config = getOverlayConfig(currentStory.mediaUrl);
            if (!config) return null;
            return (
              <>
                {config.filter === "beauty" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(255, 220, 230, 0.12)" }]} pointerEvents="none" />
                )}
                {config.filter === "bokeh" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 0, 0, 0.25)" }]} pointerEvents="none" />
                )}
                {config.filter === "greenscreen" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]} pointerEvents="none" />
                )}
                {config.filter === "cyber" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 242, 254, 0.18)" }]} pointerEvents="none" />
                )}
                {config.filter === "retro" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(230, 120, 0, 0.12)" }]} pointerEvents="none" />
                )}
                {config.filter === "neon" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(200, 0, 200, 0.12)" }]} pointerEvents="none" />
                )}
                {config.filter === "noir" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 0, 0, 0.35)" }]} pointerEvents="none" />
                )}

                {config.sticker && (
                  <View style={styles.floatingStickerContainer}>
                    <Text style={styles.floatingStickerText}>{config.sticker}</Text>
                  </View>
                )}

                {config.text && (
                  <View
                    style={[
                      styles.floatingTextContainer,
                      config.banner === "glass" && styles.bannerGlass,
                      config.banner === "teal" && styles.bannerTeal,
                      config.banner === "black" && styles.bannerBlack,
                    ]}
                  >
                    <Text
                      style={[
                        styles.floatingText,
                        {
                          color: config.banner === "teal" ? "#000000" : config.textColor,
                          fontSize: config.fontSize,
                        },
                      ]}
                    >
                      {config.text}
                    </Text>
                  </View>
                )}
              </>
            );
          })()}

          {/* Top Progress Bars */}
          <View style={styles.progressBarRow}>
            {stories.map((_, idx) => (
              <View key={idx} style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFill, getProgressStyle(idx) as any]} />
              </View>
            ))}
          </View>

          {/* Header Info */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.username ? user.username[0].toUpperCase() : "A"}
                </Text>
              </View>
              <View>
                <Text style={styles.username}>{user?.username || "loading"}</Text>
                <Text style={styles.timeText}>24h Active Story</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Caption */}
          {user && (
            <View style={styles.footer}>
              <View style={styles.captionBox}>
                <Text style={styles.captionText}>{`"${user.message}"`}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  storyWrapper: { flex: 1, position: "relative" },
  storyImage: { width: width, height: height },
  progressBarRow: {
    position: "absolute",
    top: 20,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    gap: 4,
    zIndex: 20,
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 40,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: typography.bold, fontSize: 16 },
  username: { color: "#fff", fontWeight: typography.bold, fontSize: 14 },
  timeText: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: typography.medium },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#fff", fontSize: 18, fontWeight: typography.bold },
  footer: {
    position: "absolute",
    bottom: 50,
    left: spacing.md,
    right: spacing.md,
    zIndex: 20,
  },
  captionBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  captionText: {
    color: "#fff",
    fontSize: typography.base,
    textAlign: "center",
    fontStyle: "italic",
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  floatingStickerContainer: {
    position: "absolute",
    top: "22%",
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: "rgba(0,242,254,0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  floatingStickerText: {
    fontSize: typography.base,
    fontWeight: "bold",
    color: "#fff",
  },
  floatingTextContainer: {
    position: "absolute",
    top: "40%",
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  bannerGlass: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  bannerTeal: {
    backgroundColor: "#00F2FE",
  },
  bannerBlack: {
    backgroundColor: "#000000",
  },
  floatingText: {
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
