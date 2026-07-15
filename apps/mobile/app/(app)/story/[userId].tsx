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
      // Mark current story as viewed
      viewStoryMutation.mutate(stories[currentIdx].id);

      // Start progress animation
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
        emoji: params.emoji || null,
      };
    } catch {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Main Touchable Story View */}
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

          {/* Render filters and sticker overlays */}
          {(() => {
            if (!currentStory) return null;
            const config = getOverlayConfig(currentStory.mediaUrl);
            if (!config) return null;
            return (
              <>
                {config.filter === "retro" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(230, 120, 0, 0.12)" }]} pointerEvents="none" />
                )}
                {config.filter === "neon" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(200, 0, 200, 0.12)" }]} pointerEvents="none" />
                )}
                {config.filter === "moody" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 0, 0, 0.35)" }]} pointerEvents="none" />
                )}
                {config.filter === "sunset" && (
                  <View style={[styles.filterOverlay, { backgroundColor: "rgba(255, 100, 0, 0.15)" }]} pointerEvents="none" />
                )}

                {config.emoji && (
                  <View style={styles.floatingEmojiContainer}>
                    <Text style={styles.floatingEmoji}>{config.emoji}</Text>
                  </View>
                )}

                {config.text && (
                  <View style={styles.floatingTextContainer}>
                    <Text style={[styles.floatingText, { color: config.textColor }]}>
                      {config.text}
                    </Text>
                  </View>
                )}
              </>
            );
          })()}

          {/* Overlay Gradient */}
          <View style={styles.overlay} />

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
                <Text style={styles.timeText}>Active Story</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Pinned message / icebreaker caption */}
          {user && (
            <View style={styles.footer}>
              <View style={styles.captionBox}>
                <Text style={styles.captionText}>"{user.message}"</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
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
  floatingEmojiContainer: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    zIndex: 10,
  },
  floatingEmoji: {
    fontSize: 72,
  },
  floatingTextContainer: {
    position: "absolute",
    top: "45%",
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  floatingText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
