import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

const { width } = Dimensions.get("window");
import { useQuery, useMutation } from "@tanstack/react-query";
import { usersApi, accessRequestsApi, chatsApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import { pageStyles } from "../../../lib/pageStyles";
import { Image } from "expo-image";

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

  const startChatMutation = useMutation({
    mutationFn: () => chatsApi.createChat(id),
    onSuccess: (chat: any) => {
      router.push(`/(app)/chat/${chat.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to start chat";
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
  const isApproved = user.accessStatus === "APPROVED";
  const isLocked = isPrivate && !isApproved;

  return (
    <View style={pageStyles.screen}>
      <StatusBar barStyle="light-content" />
      {/* Custom Header */}
      <View style={[pageStyles.header, { paddingTop: 12 }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={pageStyles.headerTitle}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={pageStyles.scrollContent}>
        <View style={styles.avatarCard}>
          <View style={[styles.avatar, isLocked && styles.avatarPrivate]}>
            {isLocked ? (
              <Text style={styles.avatarText}>🔒</Text>
            ) : user.profilePhotoUrl ? (
              <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={styles.avatarText}>
                {user.username[0].toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isPrivate
                ? isApproved
                  ? "🔓 Private (Approved)"
                  : "🔒 Private Profile"
                : "🔓 Public Profile"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icebreaker Message</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{`"${user.message}"`}</Text>
          </View>
        </View>

        {isLocked ? (
          <View style={styles.privateLock}>
            <Text style={styles.lockTitle}>Stories & Bio are Locked</Text>
            <Text style={styles.lockDesc}>
              {`Request permission to view @${user.username}'s active stories and detailed bio.`}
            </Text>
            {user.accessStatus === "PENDING" ? (
              <View style={[styles.actionButton, styles.buttonPending]}>
                <Text style={styles.actionButtonText}>Access Requested ⏳</Text>
              </View>
            ) : user.accessStatus === "REJECTED" ? (
              <View style={[styles.actionButton, styles.buttonRejected]}>
                <Text style={styles.actionButtonText}>Access Request Denied ❌</Text>
              </View>
            ) : (
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
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {isPrivate && isApproved && (
              <View style={styles.approvedBanner}>
                <Text style={styles.approvedBannerText}>
                  {`🔓 You have approved access to @${user.username}'s profile`}
                </Text>
              </View>
            )}
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{user.bio || "No bio description provided."}</Text>

            {/* Photoalbum section */}
            {user.photoAlbum && user.photoAlbum.length > 0 && (
              <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                <Text style={styles.sectionTitle}>📸 Fotoalbum</Text>
                <View style={styles.albumGrid}>
                  {user.photoAlbum.map((photoUrl: string, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.albumItem}
                      activeOpacity={0.9}
                      onPress={() => {
                        Alert.alert("Fotoalbum", `Fotka #${idx + 1}`);
                      }}
                    >
                      <Image source={{ uri: photoUrl }} style={styles.albumImage} contentFit="cover" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.chatButton,
                startChatMutation.isPending && styles.chatButtonDisabled,
              ]}
              onPress={() => startChatMutation.mutate()}
              disabled={startChatMutation.isPending}
            >
              {startChatMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.chatButtonText}>💬 Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md },
  back: { width: 50 },
  backText: { color: colors.primary, fontSize: typography.base, fontWeight: typography.medium },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  scroll: { gap: spacing.lg },
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
  chatButtonDisabled: {
    opacity: 0.6,
  },
  errorText: { fontSize: typography.base, color: colors.text.secondary },
  backButton: {
    backgroundColor: colors.background.card,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  buttonPending: {
    backgroundColor: colors.background.card,
    borderColor: colors.warning,
    borderWidth: 1,
    opacity: 0.8,
  },
  buttonRejected: {
    backgroundColor: colors.background.card,
    borderColor: colors.error,
    borderWidth: 1,
    opacity: 0.8,
  },
  approvedBanner: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: colors.success,
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  approvedBannerText: {
    color: colors.success,
    fontWeight: typography.medium,
    fontSize: typography.sm,
    textAlign: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  albumItem: {
    width: (width - spacing.xl * 2 - spacing.sm * 2) / 3,
    height: (width - spacing.xl * 2 - spacing.sm * 2) / 3,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  albumImage: {
    width: "100%",
    height: "100%",
  },
});
