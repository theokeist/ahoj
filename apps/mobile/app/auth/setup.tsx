import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { usersApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import { colors, typography, spacing, radius } from "../../lib/theme";

export default function ProfileSetupScreen() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [message, setMessage] = useState("");
  const [bio, setBio] = useState("");
  const [privacyMode, setPrivacyMode] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const setupMutation = useMutation({
    mutationFn: async () => {
      // First update profile options
      await usersApi.updateProfile({
        bio,
        privacyMode,
      });
      // Then update the icebreaker message
      await usersApi.updateMessage(message);
      // Fetch latest profile
      return usersApi.getMe();
    },
    onSuccess: (updatedUser) => {
      if (accessToken && refreshToken) {
        setAuth(updatedUser, accessToken, refreshToken);
      }
      router.replace("/(app)/tabs/feed");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to save profile";
      Alert.alert("Error", msg);
    },
  });

  const handleSave = () => {
    if (!message.trim()) {
      Alert.alert("Required", "Your Icebreaker Message is mandatory. It's how people find you!");
      return;
    }
    if (message.length > 60) {
      Alert.alert("Too Long", "Icebreaker Message must be 60 characters or less.");
      return;
    }
    setupMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View>
          <Text style={styles.title}>Create Your Vibe</Text>
          <Text style={styles.subtitle}>Setup your profile to start discovering</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.form}>
          {/* Avatar Placeholder */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user?.username ? user.username[0].toUpperCase() : "A"}
              </Text>
            </View>
            <Text style={styles.avatarLabel}>@{user?.username}</Text>
          </View>

          {/* Icebreaker Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mandatory Icebreaker Message (Max 60 chars)</Text>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="e.g. DJ set tonight? Lets go! 🎧"
              placeholderTextColor={colors.text.tertiary}
              maxLength={60}
              returnKeyType="next"
            />
            <Text style={styles.charCount}>{message.length}/60</Text>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people a bit about yourself..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={4}
              maxLength={160}
            />
            <Text style={styles.charCount}>{bio.length}/160</Text>
          </View>

          {/* Privacy Switch */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Privacy</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  privacyMode === "PUBLIC" && styles.toggleActive,
                ]}
                onPress={() => setPrivacyMode("PUBLIC")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    privacyMode === "PUBLIC" && styles.toggleActiveText,
                  ]}
                >
                  🔓 Public
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  privacyMode === "PRIVATE" && styles.toggleActive,
                ]}
                onPress={() => setPrivacyMode("PRIVATE")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    privacyMode === "PRIVATE" && styles.toggleActiveText,
                  ]}
                >
                  🔒 Private
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              In Private mode, nearby users see your Icebreaker Message, but your photo is
              blurred until you approve their access request.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, setupMutation.isPending && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={setupMutation.isPending || !message.trim()}
            activeOpacity={0.85}
          >
            {setupMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enter ahoj</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.black,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  form: { gap: spacing.md },
  avatarContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  avatarLabel: {
    marginTop: spacing.sm,
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.text.secondary },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: typography.base,
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: typography.xs,
    color: colors.text.tertiary,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.secondary,
  },
  toggleActiveText: {
    color: "#fff",
  },
  helpText: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: typography.md, fontWeight: typography.bold },
});
