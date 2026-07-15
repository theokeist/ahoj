import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { StoryRing } from "./StoryRing";
import { colors, spacing, typography } from "../../lib/theme";

export function StoriesBar({ myStories, nearbyUsers, me }: { myStories: any[]; nearbyUsers: any[]; me: any }) {
  const hasMyStories = myStories.length > 0;
  const usersWithStories = nearbyUsers.filter((u) => u.hasActiveStories && u.id !== me?.id);

  return (
    <View style={styles.storiesBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
        <TouchableOpacity
          style={styles.storyBubble}
          activeOpacity={0.8}
          onPress={() => {
            if (hasMyStories) {
              router.push(`/(app)/story/${me.id}`);
            } else {
              router.push(`/(app)/story/create`);
            }
          }}
        >
          <View style={styles.avatarWrapper}>
            <StoryRing hasStories={hasMyStories} size={72} />
            <View style={[styles.avatar, { width: 72, height: 72, borderRadius: 36, position: "absolute", zIndex: 10 }]}>
              {me?.profilePhotoUrl ? (
                <Image source={{ uri: me.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{me?.username ? me.username[0].toUpperCase() : "M"}</Text>
                </View>
              )}
            </View>
            {!hasMyStories && (
              <View style={styles.plusBadge}>
                <Text style={styles.plusText}>＋</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {usersWithStories.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={styles.storyBubble}
            activeOpacity={0.8}
            onPress={() => router.push(`/(app)/story/${u.id}`)}
          >
            <View style={styles.avatarWrapper}>
              <StoryRing hasStories={true} size={74} />
              <View style={[styles.avatar, { width: 74, height: 74, borderRadius: 37, position: "absolute", zIndex: 10 }]}>
                {u.profilePhotoUrl ? (
                  <Image source={{ uri: u.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{u.username[0].toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  storiesBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  storiesScroll: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  storyBubble: {
    alignItems: "center",
    justifyContent: "center",
    width: 84,
    height: 84,
  },
  avatarWrapper: { position: "relative", alignItems: "center", justifyContent: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.background.card,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
  },
  avatarInitial: { fontSize: 22, fontWeight: typography.bold, color: colors.primary },
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
});
