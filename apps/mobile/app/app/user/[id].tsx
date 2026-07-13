import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usersApi, accessRequestsApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.getUser(id),
  });

  const requestAccessMutation = useMutation({
    mutationFn: () => accessRequestsApi.request(id),
    onSuccess: () => {
      Alert.alert("Success", "Request sent! You'll be notified when they approve.");
      refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to send request";
      Alert.alert("Error", msg);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPrivate = user.privacyMode === "PRIVATE";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 50 }} /> {/* balance layout */}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarCard}>
          <View style={[styles.avatar, isPrivate && styles.avatarPrivate]}>
            {/* Show blurred placeholder or avatar icon */}
            <Text style={styles.avatarText}>
              {isPrivate ? "🔒" : user.username[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isPrivate ? "🔒 Private Profile" : "🔓 Public Profile"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Icebreaker Message</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>"{user.message}"</Text>
          </View>
        </Animated.View>

        {isPrivate ? (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.privateLock}>
            <Text style={styles.lockTitle}>Stories are Locked</Text>
            <Text style={styles.lockDesc}>
              Request permission to view @{user.username}'s active stories.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => requestAccessMutation.mutate()}
              disabled={requestAccessMutation.isPending}
            >
              {requestAccessMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Request Story Access</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{user.bio || "No bio description provided."}</Text>

            <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatButtonText}>💬 Send Message</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: { width: 50 },
  backText: { color: colors.primary, fontSize: typography.base, fontWeight: typography.medium },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  scroll: { padding: spacing.xl, gap: spacing.lg },
  avatarCard: {
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPrivate: {
    borderColor: colors.text.tertiary,
    opacity: 0.6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  username: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.background.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  badgeText: {
    fontSize: typography.xs,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  messageBox: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.base,
    color: colors.text.primary,
    fontStyle: "italic",
    textAlign: "center",
  },
  bioText: {
    fontSize: typography.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  privateLock: {
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  lockTitle: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  lockDesc: {
    fontSize: typography.sm,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  chatButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  errorText: { fontSize: typography.base, color: colors.text.secondary },
  backButton: {
    backgroundColor: colors.background.card,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
});
