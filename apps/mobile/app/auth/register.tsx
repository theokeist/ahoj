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
import { authApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import { colors, typography, spacing, radius } from "../../lib/theme";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeRegion, setActiveRegion] = useState<"ALL" | "US" | "EU" | "RU" | "ASIA">("ALL");
  const setAuth = useAuthStore((s) => s.setAuth);

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({ username, email, password }),
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace("/(app)/tabs/feed");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Registration failed";
      Alert.alert("Registration failed", msg);
    },
  });

  const oauthMutation = useMutation({
    mutationFn: (provider: string) => {
      const mockId = `${provider}_mobile_${Math.floor(100000 + Math.random() * 900000)}`;
      const mockUsername = `${provider}_${Math.floor(1000 + Math.random() * 9000)}`;
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
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "OAuth registration failed";
      Alert.alert("OAuth Error", msg);
    },
  });

  const oauthProviders = [
    { key: "google", name: "Google", region: "US", color: "#4285F4", icon: "G" },
    { key: "apple", name: "Apple", region: "US", color: "#FFFFFF", icon: "" },
    { key: "meta", name: "Meta", region: "US", color: "#1877F2", icon: "f" },
    { key: "netid", name: "NetID", region: "EU", color: "#00A88F", icon: "ID" },
    { key: "vk", name: "VK ID", region: "RU", color: "#0077FF", icon: "VK" },
    { key: "yandex", name: "Yandex", region: "RU", color: "#FC3F1D", icon: "Y" },
    { key: "wechat", name: "WeChat", region: "ASIA", color: "#07C160", icon: "微" },
    { key: "line", name: "LINE", region: "ASIA", color: "#00B900", icon: "L" },
    { key: "kakao", name: "Kakao", region: "ASIA", color: "#FEE500", icon: "K" },
  ] as const;

  const filteredProviders = activeRegion === "ALL"
    ? oauthProviders
    : oauthProviders.filter((p) => p.region === activeRegion);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Join ahoj</Text>
          <Text style={styles.subtitle}>Create your proximity social profile</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="alex_24"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={() => registerMutation.mutate()}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
            onPress={() => registerMutation.mutate()}
            disabled={registerMutation.isPending || !username || !email || !password}
            activeOpacity={0.85}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or register with Global OAuth</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Region Tabs */}
          <View style={styles.regionTabs}>
            {(["ALL", "US", "EU", "RU", "ASIA"] as const).map((reg) => (
              <TouchableOpacity
                key={reg}
                onPress={() => setActiveRegion(reg)}
                style={[styles.regionTab, activeRegion === reg && styles.regionTabActive]}
              >
                <Text style={[styles.regionTabText, activeRegion === reg && styles.regionTabTextActive]}>
                  {reg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* OAuth Buttons Grid */}
          <View style={styles.oauthGrid}>
            {filteredProviders.map((p) => (
              <TouchableOpacity
                key={p.key}
                disabled={oauthMutation.isPending}
                onPress={() => oauthMutation.mutate(p.key)}
                style={styles.oauthButton}
              >
                <View
                  style={[
                    styles.oauthIcon,
                    { backgroundColor: p.color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : p.color },
                  ]}
                >
                  <Text style={[styles.oauthIconText, { color: p.color === "#FEE500" ? "#000" : "#FFF" }]}>
                    {p.icon}
                  </Text>
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
          <Text style={styles.footerText}>{"Already have an account? "}</Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  back: { marginBottom: spacing.lg },
  backText: { color: colors.primary, fontSize: typography.base, fontWeight: typography.medium },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.black,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: typography.base, color: colors.text.secondary, marginBottom: spacing.lg },
  form: { gap: spacing.md },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.text.secondary },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: typography.base,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#000", fontSize: typography.md, fontWeight: typography.bold },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: spacing.md, gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  dividerText: { color: colors.text.tertiary, fontSize: typography.xs },
  regionTabs: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  regionTab: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.background.card },
  regionTabActive: { backgroundColor: colors.primary },
  regionTabText: { color: colors.text.secondary, fontSize: typography.xs, fontWeight: typography.medium },
  regionTabTextActive: { color: "#000", fontWeight: typography.bold },
  oauthGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  oauthButton: {
    width: "31%",
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  oauthIcon: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  oauthIconText: { fontSize: 11, fontWeight: "bold" },
  oauthName: { color: colors.text.primary, fontSize: typography.xs, flex: 1 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.text.secondary, fontSize: typography.base },
  footerLink: { color: colors.primary, fontSize: typography.base, fontWeight: typography.semibold },
});
