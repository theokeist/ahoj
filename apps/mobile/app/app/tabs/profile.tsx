import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../store";
import { usersApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [message, setMessage] = useState(user?.message || "");
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: usersApi.getMe,
    initialData: user || undefined,
  });

  const updateMessageMutation = useMutation({
    mutationFn: () => usersApi.updateMessage(message),
    onSuccess: (data: any) => {
      setIsEditingMessage(false);
      if (profile && accessToken) {
        setAuth({ ...profile, message: data.message }, accessToken);
      }
      refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to update message";
      Alert.alert("Error", msg);
    },
  });

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of ahoj?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.username ? profile.username[0].toUpperCase() : "A"}
            </Text>
          </View>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {profile?.privacyMode === "PUBLIC" ? "🔓 Public" : "🔒 Private"}
            </Text>
          </View>
        </Animated.View>

        {/* Icebreaker Message Editor */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Icebreaker Message</Text>
          {isEditingMessage ? (
            <View style={styles.editorRow}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                maxLength={60}
                placeholder="Icebreaker Message"
                placeholderTextColor={colors.text.tertiary}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelBtn]}
                  onPress={() => setIsEditingMessage(false)}
                >
                  <Text style={styles.actionBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveBtn]}
                  onPress={() => updateMessageMutation.mutate()}
                  disabled={updateMessageMutation.isPending}
                >
                  {updateMessageMutation.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.actionBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>"{profile?.message}"</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditingMessage(true)}
              >
                <Text style={styles.editBtnText}>✏️ Edit Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={styles.infoValue}>{profile?.bio || "No bio yet"}</Text>
          </View>
          {profile?.website && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue}>{profile.website}</Text>
            </View>
          )}
        </Animated.View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scroll: { padding: spacing.xl, gap: spacing.lg },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: typography.bold,
    color: "#fff",
  },
  username: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  email: {
    fontSize: typography.sm,
    color: colors.text.secondary,
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
    gap: spacing.md,
  },
  messageText: {
    fontSize: typography.base,
    color: colors.text.primary,
    fontStyle: "italic",
    textAlign: "center",
  },
  editBtn: {
    alignSelf: "center",
  },
  editBtnText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  editorRow: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.text.primary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: typography.base,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
});
