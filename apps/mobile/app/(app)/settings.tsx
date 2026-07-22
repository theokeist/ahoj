import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accessRequestsApi, feedApi, infoApi, usersApi } from "../../lib/api";
import { useAuthStore, useLocationStore, useSettingsStore } from "../../store";
import { colors, spacing, typography, radius } from "../../lib/theme";
import { pageStyles } from "../../lib/pageStyles";
import { Image } from "expo-image";
import { TRANSLATIONS, type SupportedLanguage } from "@ahoj/shared";

/**
 * SettingsScreen — Ant Design Mobile Styled Settings
 * Ant Design Token Alignment:
 *   colorPrimary: #00F2FE, colorBgBase: #0C0C0C, colorBgContainer: #121212, borderRadius: 16
 *   Immediate Save on Change with full i18n translation support
 */
export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const me = useAuthStore((s) => s.user);
  const { isGhostMode, setGhostMode } = useLocationStore();
  const { showStoryBar, setShowStoryBar } = useSettingsStore();

  const [language, setLanguage] = useState<SupportedLanguage>("cs");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    username: me?.username || "",
    bio: "",
    message: me?.message || "Ahoj!",
    avatarUrl: me?.profilePhotoUrl || "",
    privacyMode: (me?.privacyMode || "PUBLIC") as "PUBLIC" | "PRIVATE" | "GHOST",
    ghostFuzzRadiusMeters: 300,
    allowDirectMessages: "EVERYONE" as "EVERYONE" | "APPROVED" | "NOBODY",
    showDistanceToOthers: true,
    notifications: {
      pushEnabled: true,
      nearbyUsersAlert: true,
      sparksAlert: true,
      messagesAlert: true,
      accessRequestAlert: true,
      soundEnabled: true,
    },
    language: "cs" as SupportedLanguage,
    distanceUnit: "metric" as "metric" | "imperial",
  });

  const t = TRANSLATIONS[language] ?? TRANSLATIONS.cs;

  // Load Settings Query
  const { data: dbSettings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => usersApi.getSettings(),
  });

  useEffect(() => {
    if (dbSettings) {
      setSettings((prev) => ({
        ...prev,
        privacyMode: dbSettings.privacyMode ?? prev.privacyMode,
        ghostFuzzRadiusMeters: dbSettings.ghostFuzzRadiusMeters ?? 300,
        allowDirectMessages: dbSettings.allowDirectMessages ?? "EVERYONE",
        showDistanceToOthers: dbSettings.showDistanceToOthers ?? true,
        notifications: dbSettings.notifications ?? prev.notifications,
        language: dbSettings.language ?? prev.language,
        distanceUnit: dbSettings.distanceUnit ?? "metric",
      }));
      if (dbSettings.language && TRANSLATIONS[dbSettings.language as SupportedLanguage]) {
        setLanguage(dbSettings.language as SupportedLanguage);
      }
    }
  }, [dbSettings]);

  // Immediate Save Handler
  const handleImmediateChange = async (key: string, value: any) => {
    let updated: typeof settings;
    if (key.startsWith("notifications.")) {
      const subKey = key.split(".")[1];
      updated = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [subKey]: value,
        },
      };
    } else {
      updated = { ...settings, [key]: value };
    }

    setSettings(updated);

    if (key === "privacyMode") {
      setGhostMode(value === "GHOST");
    }

    if (key === "language") {
      setLanguage(value as SupportedLanguage);
    }

    setSaveToast(t.settings.saved);
    setTimeout(() => setSaveToast(null), 2000);

    try {
      if (key === "message") {
        await usersApi.updateMessage(value);
      } else if (["username", "bio", "avatarUrl"].includes(key)) {
        await usersApi.updateProfile({
          username: updated.username,
          bio: updated.bio,
          profilePhotoUrl: updated.avatarUrl,
          privacyMode: updated.privacyMode,
        });
      }

      await usersApi.updateSettings({
        privacyMode: updated.privacyMode,
        ghostFuzzRadiusMeters: updated.ghostFuzzRadiusMeters,
        allowDirectMessages: updated.allowDirectMessages,
        showDistanceToOthers: updated.showDistanceToOthers,
        notifications: updated.notifications,
        language: updated.language,
        distanceUnit: updated.distanceUnit,
      });
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    } catch {
      // Silent catch
    }
  };

  const [isDemoMode, setIsDemoMode] = useState(false);
  const seedDemoMutation = useMutation({
    mutationFn: () => feedApi.seedDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Demo Mode", "Demo users moved nearby! 🚀");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Error activating demo mode";
      Alert.alert("Error", msg);
      setIsDemoMode(false);
    },
  });

  const handleToggleDemoMode = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      seedDemoMutation.mutate();
    }
  };

  // Incoming Requests Query
  const { data: incomingRequests = [], isLoading } = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: () => accessRequestsApi.getIncoming(),
  });

  // Approve & Deny Mutations
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => accessRequestsApi.approve(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Approved", "Access request approved.");
    },
  });

  const denyMutation = useMutation({
    mutationFn: (requestId: string) => accessRequestsApi.deny(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      Alert.alert("Denied", "Access request denied.");
    },
  });

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  const languagesList: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: "cs", label: "Čeština", flag: "🇨🇿" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "sk", label: "Slovenčina", flag: "🇸🇰" },
    { code: "pl", label: "Polski", flag: "🇵🇱" },
    { code: "uk", label: "Українська", flag: "🇺🇦" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  return (
    <View style={pageStyles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={pageStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={pageStyles.backButton}>
          <Text style={pageStyles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={pageStyles.headerTitle}>{t.settings.title}</Text>
        <View style={pageStyles.headerSpacer} />
      </View>

      {saveToast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>✓ {saveToast}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={pageStyles.scrollContent}>

        {/* SECTION 1: ANT DESIGN PROFILE CARD */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>👤 {t.settings.profile}</Text>
          <View style={styles.antCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.settings.username}</Text>
              <TextInput
                value={settings.username}
                onChangeText={(val) => handleImmediateChange("username", val)}
                style={styles.antInput}
                placeholder="Username"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.settings.statusMessage}</Text>
              <TextInput
                value={settings.message}
                onChangeText={(val) => handleImmediateChange("message", val)}
                style={styles.antInput}
                placeholder="Status message"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.settings.bio}</Text>
              <TextInput
                value={settings.bio}
                onChangeText={(val) => handleImmediateChange("bio", val)}
                style={[styles.antInput, { height: 70 }]}
                multiline
                placeholder="Bio description"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>
        </View>

        {/* SECTION 2: PRIVACY & PROXIMITY (ANT DESIGN SEGMENTED CONTROL) */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>👻 {t.settings.privacy}</Text>
          <View style={styles.antCard}>
            <Text style={styles.inputLabel}>Proximity Mode</Text>
            <View style={styles.segmentedContainer}>
              {[
                { id: "PUBLIC", label: t.settings.privacyPublic },
                { id: "GHOST", label: t.settings.privacyGhost },
                { id: "PRIVATE", label: t.settings.privacyPrivate },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => handleImmediateChange("privacyMode", m.id)}
                  style={[
                    styles.segmentedSegment,
                    settings.privacyMode === m.id && styles.segmentedActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      settings.privacyMode === m.id && styles.segmentedActiveText,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ghost Fuzz Slider Info */}
            <View style={styles.antRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.settings.ghostFuzz}</Text>
                <Text style={styles.settingDescription}>{settings.ghostFuzzRadiusMeters}m {t.settings.ghostFuzzDesc}</Text>
              </View>
            </View>

            {/* Direct Message Permission */}
            <View style={[styles.antRow, { marginTop: spacing.md }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.settings.dmPermission}</Text>
                <View style={styles.chipRow}>
                  {[
                    { id: "EVERYONE", label: t.settings.dmEveryone },
                    { id: "APPROVED", label: t.settings.dmApproved },
                    { id: "NOBODY", label: t.settings.dmNobody },
                  ].map((chip) => (
                    <TouchableOpacity
                      key={chip.id}
                      onPress={() => handleImmediateChange("allowDirectMessages", chip.id)}
                      style={[
                        styles.chip,
                        settings.allowDirectMessages === chip.id && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          settings.allowDirectMessages === chip.id && styles.chipActiveText,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Distance Toggle */}
            <View style={[styles.antRow, { marginTop: spacing.md }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.settings.showDistance}</Text>
                <Text style={styles.settingDescription}>{t.settings.showDistanceDesc}</Text>
              </View>
              <Switch
                value={settings.showDistanceToOthers}
                onValueChange={(val) => handleImmediateChange("showDistanceToOthers", val)}
                trackColor={{ false: "#444", true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {/* Story Bar Toggle */}
            <View style={[styles.antRow, { marginTop: spacing.md }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Story Bar</Text>
                <Text style={styles.settingDescription}>Show top story bar on radar feed</Text>
              </View>
              <Switch
                value={showStoryBar}
                onValueChange={setShowStoryBar}
                trackColor={{ false: "#444", true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* SECTION 3: NOTIFICATIONS & SOUND */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>🔔 {t.settings.notifications}</Text>
          <View style={styles.antCard}>
            {[
              { key: "notifications.pushEnabled", label: t.settings.pushEnabled, val: settings.notifications.pushEnabled },
              { key: "notifications.nearbyUsersAlert", label: t.settings.nearbyAlert, val: settings.notifications.nearbyUsersAlert },
              { key: "notifications.sparksAlert", label: t.settings.sparksAlert, val: settings.notifications.sparksAlert },
              { key: "notifications.messagesAlert", label: t.settings.messagesAlert, val: settings.notifications.messagesAlert },
              { key: "notifications.soundEnabled", label: t.settings.soundEnabled, val: settings.notifications.soundEnabled },
            ].map((n, idx) => (
              <View key={n.key} style={[styles.antRow, idx > 0 && { marginTop: spacing.md }]}>
                <Text style={styles.settingLabel}>{n.label}</Text>
                <Switch
                  value={n.val}
                  onValueChange={(val) => handleImmediateChange(n.key, val)}
                  trackColor={{ false: "#444", true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 4: LANGUAGE & APP PREFERENCES */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>🌐 {t.settings.appPreferences}</Text>
          <View style={styles.antCard}>
            <Text style={styles.inputLabel}>{t.settings.language}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
              {languagesList.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleImmediateChange("language", lang.code)}
                  style={[
                    styles.langChip,
                    language === lang.code && styles.langChipActive,
                  ]}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langText, language === lang.code && styles.langTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.antRow, { marginTop: spacing.md }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.settings.distanceUnit}</Text>
              </View>
              <View style={styles.chipRow}>
                {[
                  { id: "metric", label: t.settings.metric },
                  { id: "imperial", label: t.settings.imperial },
                ].map((unit) => (
                  <TouchableOpacity
                    key={unit.id}
                    onPress={() => handleImmediateChange("distanceUnit", unit.id)}
                    style={[
                      styles.chip,
                      settings.distanceUnit === unit.id && styles.chipActive,
                    ]}
                  >
                    <Text style={[styles.chipText, settings.distanceUnit === unit.id && styles.chipActiveText]}>
                      {unit.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Demo Mode Row */}
            <View style={[styles.antRow, { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>🚀 Demo Mode</Text>
                <Text style={styles.settingDescription}>Move demo users (Bob, Alice, Charlie) nearby.</Text>
              </View>
              {seedDemoMutation.isPending ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Switch
                  value={isDemoMode}
                  onValueChange={handleToggleDemoMode}
                  trackColor={{ false: "#444", true: colors.primary }}
                  thumbColor="#fff"
                />
              )}
            </View>
          </View>
        </View>

        {/* SECTION 5: ACCESS REQUESTS */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>🔑 {t.requests.title}</Text>
          <View style={styles.antCard}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.md }} />
            ) : incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t.requests.noRequests} 🌟</Text>
              </View>
            ) : (
              incomingRequests.map((req: any) => (
                <View key={req.id} style={styles.requestItem}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarWrapper}>
                      {req.requester.profilePhotoUrl ? (
                        <Image source={{ uri: req.requester.profilePhotoUrl }} style={styles.avatar} contentFit="cover" />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarInitial}>{req.requester.username[0].toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.username}>@{req.requester.username}</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => approveMutation.mutate(req.id)}>
                      <Text style={styles.approveBtnText}>{t.requests.approve}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.denyBtn]} onPress={() => denyMutation.mutate(req.id)}>
                      <Text style={styles.denyBtnText}>{t.requests.deny}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* LOGOUT */}
        <View style={pageStyles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>{t.nav.signOut}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>ahoj app v0.1.0 • Made with 💜</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  antCard: {
    backgroundColor: "#121212",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
  },
  toastBanner: {
    backgroundColor: "rgba(76,175,80,0.15)",
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  toastText: {
    color: colors.success,
    fontSize: typography.xs,
    fontWeight: typography.bold,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.text.secondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  antInput: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: typography.sm,
  },
  antRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  settingTextContainer: { flex: 1 },
  settingLabel: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  segmentedSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  segmentedActive: {
    backgroundColor: colors.primary,
  },
  segmentedText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.text.secondary,
  },
  segmentedActiveText: {
    color: "#000",
    fontWeight: typography.bold,
  },
  chipRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipActive: {
    backgroundColor: "rgba(0,242,254,0.15)",
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.xs,
    color: colors.text.secondary,
  },
  chipActiveText: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
  langScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  langChipActive: {
    backgroundColor: "rgba(0,242,254,0.15)",
    borderColor: colors.primary,
  },
  langFlag: {
    fontSize: 16,
  },
  langText: {
    fontSize: typography.xs,
    color: colors.text.secondary,
  },
  langTextActive: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
  emptyState: { alignItems: "center", paddingVertical: spacing.md },
  emptyText: { color: colors.text.tertiary, fontSize: typography.base, fontWeight: typography.medium },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  avatarWrapper: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: { width: "100%", height: "100%", backgroundColor: colors.background.card, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: colors.text.primary, fontSize: typography.base, fontWeight: typography.bold },
  username: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.text.primary },
  actionButtons: { flexDirection: "row", gap: spacing.xs },
  actionBtn: { paddingVertical: 5, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  approveBtn: { backgroundColor: colors.success + "22", borderWidth: 1, borderColor: colors.success },
  approveBtnText: { color: colors.success, fontSize: typography.xs, fontWeight: typography.bold },
  denyBtn: { backgroundColor: colors.error + "22", borderWidth: 1, borderColor: colors.error },
  denyBtnText: { color: colors.error, fontSize: typography.xs, fontWeight: typography.bold },
  logoutBtn: { backgroundColor: colors.error, borderRadius: radius.full, paddingVertical: 14, alignItems: "center" },
  logoutBtnText: { color: "#fff", fontSize: typography.base, fontWeight: typography.bold },
  versionText: { textAlign: "center", color: colors.text.tertiary, fontSize: typography.xs, marginTop: spacing.md },
});
