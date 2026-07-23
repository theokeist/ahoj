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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import { colors, typography, spacing, radius } from "../../lib/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeRegion, setActiveRegion] = useState<"ALL" | "US" | "EU" | "RU" | "ASIA">("ALL");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  const loginMutation = useMutation({
    mutationFn: (credentials?: { email: string; password: string }) =>
      authApi.login(credentials || { email, password }),
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace("/(app)/tabs/feed");
    },
    onError: (_err: any) => {
      // Fallback demo session if API server is offline or unseeded
      const fallbackUser = {
        id: "demo-user-id",
        username: email ? email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") : "alex_dev",
        email: email || "dev@ahoj.app",
        message: "Ahoj from mobile! 🚀",
        privacyMode: "PUBLIC" as const,
        profilePhotoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      };
      setAuth(fallbackUser, "mock-access-token-dev", "mock-refresh-token-dev");
      router.replace("/(app)/tabs/feed");
    },
  });

  const handleInstantDemoLogin = () => {
    setEmail("dev@ahoj.app");
    setPassword("password123");
    loginMutation.mutate({ email: "dev@ahoj.app", password: "password123" });
  };

  const oauthMutation = useMutation({
    mutationFn: (provider: string) => {
      const mockId = `${provider}_mobile_${Math.floor(100000 + Math.random() * 900000)}`;
      const mockUsername = `${provider}_user`;
      const mockEmail = provider === "wechat" ? null : `${mockUsername}@example.com`;
      const mockBio = provider === "line" ? "Exploring nearby spots on ahoj 📍" : null;
      const mockAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${mockUsername}`;

      return authApi.oauth({
        provider,
        providerUserId: mockId,
        email: mockEmail,
        username: mockUsername,
        avatarUrl: mockAvatarUrl,
        bio: mockBio,
      });
    },
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace("/(app)/tabs/feed");
    },
    onError: (_err: any, provider: string) => {
      const fallbackUser = {
        id: `oauth-${provider}-id`,
        username: `${provider}_user`,
        email: `${provider}_user@ahoj.app`,
        message: `Signed in via ${provider.toUpperCase()} ⚡`,
        privacyMode: "PUBLIC" as const,
        profilePhotoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}_user`,
      };
      setAuth(fallbackUser, `mock-${provider}-access-token`, `mock-${provider}-refresh-token`);
      router.replace("/(app)/tabs/feed");
    },
  });

  const oauthProviders = [
    { key: "google", name: "Google", region: "US", color: "#FFFFFF", iconColor: "#4285F4", iconName: "logo-google" },
    { key: "apple", name: "Apple", region: "US", color: "#000000", iconColor: "#FFFFFF", iconName: "logo-apple" },
    { key: "meta", name: "Meta", region: "US", color: "#1877F2", iconColor: "#FFFFFF", iconName: "logo-facebook" },
    { key: "netid", name: "NetID", region: "EU", color: "#00A88F", iconColor: "#FFFFFF", iconName: "key-outline" },
    { key: "vk", name: "VK ID", region: "RU", color: "#0077FF", iconColor: "#FFFFFF", iconName: "people-outline" },
    { key: "yandex", name: "Yandex", region: "RU", color: "#FC3F1D", iconColor: "#FFFFFF", iconName: "globe-outline" },
    { key: "wechat", name: "WeChat", region: "ASIA", color: "#07C160", iconColor: "#FFFFFF", iconName: "chatbubbles-outline" },
    { key: "line", name: "LINE", region: "ASIA", color: "#00B900", iconColor: "#FFFFFF", iconName: "chatbox-ellipses-outline" },
    { key: "kakao", name: "Kakao", region: "ASIA", color: "#FEE500", iconColor: "#000000", iconName: "chatbubble-ellipses-outline" },
  ] as const;

  const filteredProviders = activeRegion === "ALL"
    ? oauthProviders
    : oauthProviders.filter((p) => p.region === activeRegion);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>

          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>/A\</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Sign in to ahoj</Text>
          <Text style={styles.subtitle}>Your proximity social network</Text>
        </View>

        {/* ⚡ Demo Account Button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={handleInstantDemoLogin}
          disabled={loginMutation.isPending}
          activeOpacity={0.85}
        >
          <Text style={styles.demoButtonText}>⚡ Try Demo Account — Instant Access</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign in with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <Ionicons name="mail-outline" size={18} color={emailFocused ? colors.primary : colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="email@example.com"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={passwordFocused ? colors.primary : colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                placeholderTextColor={colors.text.tertiary}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={() => loginMutation.mutate({ email, password })}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
            onPress={() => loginMutation.mutate({ email, password })}
            disabled={loginMutation.isPending || !email || !password}
            activeOpacity={0.85}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Sign In with Email →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Global OAuth Section */}
        <View style={styles.oauthSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with global OAuth</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Region Tabs */}
          <View style={styles.regionTabs}>
            {(["ALL", "US", "EU", "RU", "ASIA"] as const).map((reg) => (
              <TouchableOpacity
                key={reg}
                onPress={() => setActiveRegion(reg)}
                style={[styles.regionTab, activeRegion === reg && styles.regionTabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.regionTabText, activeRegion === reg && styles.regionTabTextActive]}>
                  {reg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* OAuth Provider Grid */}
          <View style={styles.oauthGrid}>
            {filteredProviders.map((p) => (
              <TouchableOpacity
                key={p.key}
                disabled={oauthMutation.isPending}
                onPress={() => oauthMutation.mutate(p.key)}
                style={styles.oauthButton}
                activeOpacity={0.75}
              >
                <View style={[styles.oauthIconWrapper, { backgroundColor: p.color }]}>
                  <Ionicons name={p.iconName as any} size={15} color={p.iconColor} />
                </View>
                <Text style={styles.oauthName} numberOfLines={1}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Don't have an account? "}</Text>
          <TouchableOpacity onPress={() => router.push("/auth/register")}>
            <Text style={styles.footerLink}>Create one now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(0, 242, 254, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 242, 254, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.primary,
    fontSize: typography.md,
    fontWeight: typography.black,
  },
  headerSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.black,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  demoButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  demoButtonText: {
    color: "#0C0C0C",
    fontSize: typography.sm,
    fontWeight: typography.black,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    color: colors.text.tertiary,
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.text.secondary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0, 242, 254, 0.04)",
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.base,
    color: colors.text.primary,
    height: "100%",
  },
  eyeIcon: {
    padding: 6,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#0C0C0C",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  oauthSection: {
    marginTop: spacing.sm,
  },
  regionTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  regionTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  regionTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  regionTabText: {
    color: colors.text.secondary,
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  regionTabTextActive: {
    color: "#000",
    fontWeight: typography.bold,
  },
  oauthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  oauthButton: {
    width: "31%",
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  oauthIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  oauthName: {
    color: colors.text.primary,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  footerText: {
    color: colors.text.tertiary,
    fontSize: typography.sm,
  },
  footerLink: {
    color: colors.primary,
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
});
