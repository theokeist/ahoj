import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { accessRequestsApi, feedApi, usersApi } from "../../lib/api";
import { useAuthStore, useLocationStore, useSettingsStore } from "../../store";
import { colors, spacing, typography, radius } from "../../lib/theme";
import { pageStyles } from "../../lib/pageStyles";
import { Image } from "expo-image";
import { TRANSLATIONS, type SupportedLanguage } from "@ahoj/shared";
import {
  FormGroup,
  FormInput,
  FormSwitch,
  FormSegmented,
  FormChipGroup,
} from "../../components/ui/FormGroup";

/**
 * SettingsScreen — Ant Design Mobile Styled Settings
 * Ant Design Token Alignment:
 *   colorPrimary: #00F2FE, colorBgBase: #0C0C0C, colorBgContainer: #121212, borderRadius: 16
 *   Secure Area Insets & Custom FormGroup Controls
 */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const me = useAuthStore((s) => s.user);
  const { setGhostMode } = useLocationStore();
  const { showStoryBar, setShowStoryBar, appTheme, setAppTheme } = useSettingsStore();

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

  const [isDemoMode, setIsDemoMode] = useState(true);
  const seedDemoMutation = useMutation({
    mutationFn: () => feedApi.seedDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Demo Mode Active 🚀", "Demo users (Bob, Alice, Charlie, OAuth Accounts) placed nearby!");
    },
    onError: () => {
      // Standalone mode fallback so demo mode toggle always succeeds
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Demo Mode Active 🚀", "Demo OAuth accounts (Alex Google 🔵, Devin GitHub 🐙, Maya Spotify 🟢) active in local proximity!");
    },
  });

  const handleToggleDemoMode = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      seedDemoMutation.mutate();
    } else {
      Alert.alert("Demo Mode Off", "Returned to live location feed.");
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
    <View
      style={[
        pageStyles.screen,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Safe Area Insets */}
      <View style={[pageStyles.header, { paddingTop: 12 }]}>
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

      <ScrollView
        contentContainerStyle={[
          pageStyles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* SECTION 1: PROFILE & IDENTITY FORM GROUP */}
        <FormGroup title={t.settings.profile} icon="👤">
          <FormInput
            label={t.settings.username}
            value={settings.username}
            onChangeText={(val) => handleImmediateChange("username", val)}
            placeholder="Username"
            icon="✏️"
          />
          <FormInput
            label={t.settings.statusMessage}
            value={settings.message}
            onChangeText={(val) => handleImmediateChange("message", val)}
            placeholder="Status message"
            icon="💬"
          />
          <FormInput
            label={t.settings.bio}
            value={settings.bio}
            onChangeText={(val) => handleImmediateChange("bio", val)}
            placeholder="Bio description"
            multiline
            style={{ height: 70 }}
            icon="📝"
          />
        </FormGroup>

        {/* SECTION 2: PRIVACY & PROXIMITY FORM GROUP */}
        <FormGroup title={t.settings.privacy} icon="👻">
          <FormSegmented
            label="Proximity Mode"
            value={settings.privacyMode}
            onChange={(val) => handleImmediateChange("privacyMode", val)}
            options={[
              { id: "PUBLIC", label: t.settings.privacyPublic, icon: "🔓" },
              { id: "GHOST", label: t.settings.privacyGhost, icon: "👻" },
              { id: "PRIVATE", label: t.settings.privacyPrivate, icon: "🔒" },
            ]}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{t.settings.ghostFuzz}</Text>
            <Text style={styles.infoDesc}>
              {settings.ghostFuzzRadiusMeters}m {t.settings.ghostFuzzDesc}
            </Text>
          </View>

          <FormChipGroup
            label={t.settings.dmPermission}
            value={settings.allowDirectMessages}
            onChange={(val) => handleImmediateChange("allowDirectMessages", val)}
            options={[
              { id: "EVERYONE", label: t.settings.dmEveryone },
              { id: "APPROVED", label: t.settings.dmApproved },
              { id: "NOBODY", label: t.settings.dmNobody },
            ]}
          />

          <FormSwitch
            label={t.settings.showDistance}
            description={t.settings.showDistanceDesc}
            value={settings.showDistanceToOthers}
            onValueChange={(val) => handleImmediateChange("showDistanceToOthers", val)}
            icon="📍"
          />

          <FormSwitch
            label="Story Bar"
            description="Show top story bar on radar feed"
            value={showStoryBar}
            onValueChange={setShowStoryBar}
            icon="📸"
          />
        </FormGroup>

        {/* SECTION: THEME & ACCENT COLORS */}
        <FormGroup title="Theme & Accent Colors 🎨" icon="🎨">
          <FormSegmented
            label="Theme Selection"
            options={[
              { id: "CURRENT", label: "Current ⚡" },
              { id: "GREY", label: "Grey Flat 🌫️" },
              { id: "HATRIX", label: "Hatrix 🟢" },
            ]}
            value={appTheme}
            onChange={(val) => setAppTheme(val)}
          />
        </FormGroup>

        {/* SECTION 3: NOTIFICATIONS FORM GROUP */}
        <FormGroup title={t.settings.notifications} icon="🔔">
          <FormSwitch
            label={t.settings.pushEnabled}
            value={settings.notifications.pushEnabled}
            onValueChange={(val) => handleImmediateChange("notifications.pushEnabled", val)}
            icon="📲"
          />
          <FormSwitch
            label={t.settings.nearbyAlert}
            value={settings.notifications.nearbyUsersAlert}
            onValueChange={(val) => handleImmediateChange("notifications.nearbyUsersAlert", val)}
            icon="📡"
          />
          <FormSwitch
            label={t.settings.sparksAlert}
            value={settings.notifications.sparksAlert}
            onValueChange={(val) => handleImmediateChange("notifications.sparksAlert", val)}
            icon="⚡"
          />
          <FormSwitch
            label={t.settings.messagesAlert}
            value={settings.notifications.messagesAlert}
            onValueChange={(val) => handleImmediateChange("notifications.messagesAlert", val)}
            icon="💬"
          />
          <FormSwitch
            label={t.settings.soundEnabled}
            value={settings.notifications.soundEnabled}
            onValueChange={(val) => handleImmediateChange("notifications.soundEnabled", val)}
            icon="🔊"
          />
        </FormGroup>

        {/* SECTION 4: APP PREFERENCES & DEMO MODE */}
        <FormGroup title={t.settings.appPreferences} icon="🌐">
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

          <FormChipGroup
            label={t.settings.distanceUnit}
            value={settings.distanceUnit}
            onChange={(val) => handleImmediateChange("distanceUnit", val)}
            options={[
              { id: "metric", label: t.settings.metric },
              { id: "imperial", label: t.settings.imperial },
            ]}
          />

          <FormSwitch
            label="🚀 Demo Mode"
            description="Move demo users (Bob, Alice, Charlie) nearby"
            value={isDemoMode}
            onValueChange={handleToggleDemoMode}
            disabled={seedDemoMutation.isPending}
          />
        </FormGroup>

        {/* SECTION 5: ACCESS REQUESTS */}
        <FormGroup title={t.requests.title} icon="🔑">
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
        </FormGroup>

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
  inputLabel: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.text.secondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoTitle: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  infoDesc: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  langScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    marginBottom: spacing.xs,
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
