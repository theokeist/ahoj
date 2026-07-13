import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Image } from "expo-image";
import { storiesApi, usersApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  cancelAnimation,
  LinearTransition,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [currentIdx, setCurrentIdx] = useState(0);
  const progress = useSharedValue(0);
  const isPaused = useRef(false);

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
      progress.value = 0;
      progress.value = withTiming(1, { duration: STORY_DURATION }, (finished) => {
        if (finished) {
          runOnJS(handleNext)();
        }
      });
    }
    return () => {
      cancelAnimation(progress);
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
    isPaused.current = true;
    cancelAnimation(progress);
  };

  const handlePressOut = () => {
    isPaused.current = false;
    // Resume animation from current progress position
    const remainingTime = STORY_DURATION * (1 - progress.value);
    progress.value = withTiming(1, { duration: remainingTime }, (finished) => {
      if (finished) {
        runOnJS(handleNext)();
      }
    });
  };

  const progressStyle = (idx: number) => {
    return useAnimatedStyle(() => {
      if (idx < currentIdx) return { width: "100%" };
      if (idx > currentIdx) return { width: "0%" };
      return { width: `${progress.value * 100}%` };
    });
  };

  if (isLoading || !stories) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const currentStory = stories[currentIdx];

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

          {/* Overlay Gradient */}
          <View style={styles.overlay} />

          {/* Top Progress Bars */}
          <View style={styles.progressBarRow}>
            {stories.map((_, idx) => (
              <View key={idx} style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFill, progressStyle(idx)]} />
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
});
