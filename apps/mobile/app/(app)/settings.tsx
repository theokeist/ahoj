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
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accessRequestsApi, feedApi, infoApi } from "../../lib/api";
import { useAuthStore, useLocationStore, useSettingsStore } from "../../store";
import { colors, spacing, typography, radius } from "../../lib/theme";
import { pageStyles } from "../../lib/pageStyles";
import { Image } from "expo-image";

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const me = useAuthStore((s) => s.user);
  const { isGhostMode, setGhostMode } = useLocationStore();
  const { showStoryBar, setShowStoryBar } = useSettingsStore();

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
    }
  });

  const handleToggleDemoMode = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      seedDemoMutation.mutate();
    }
  };

  // Query incoming requests
  const {
    data: incomingRequests = [],
    isLoading,
  } = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: () => accessRequestsApi.getIncoming(),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => accessRequestsApi.approve(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Approved", "User now has access to your stories.");
    },
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: (requestId: string) => accessRequestsApi.deny(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      Alert.alert("Denied", "Access request denied.");
    },
  });

  const { data: appInfo } = useQuery({
    queryKey: ["app-info"],
    queryFn: infoApi.getAppInfo,
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

  const oauthProviders = [
    { key: "google", name: "Google", region: "US", color: "#4285F4" },
    { key: "apple", name: "Apple", region: "US", color: "#FFFFFF" },
    { key: "meta", name: "Meta", region: "US", color: "#1877F2" },
    { key: "netid", name: "NetID", region: "EU", color: "#00A88F" },
    { key: "vk", name: "VK ID", region: "RU", color: "#0077FF" },
    { key: "yandex", name: "Yandex", region: "RU", color: "#FC3F1D" },
    { key: "wechat", name: "WeChat", region: "ASIA", color: "#07C160" },
    { key: "line", name: "LINE", region: "ASIA", color: "#00B900" },
    { key: "kakao", name: "Kakao", region: "ASIA", color: "#FEE500" },
  ];

  return (
    <View style={pageStyles.screen}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={pageStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={pageStyles.backButton}>
          <Text style={pageStyles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={pageStyles.headerTitle}>Settings</Text>
        <View style={pageStyles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={pageStyles.scrollContent}>
        {/* Proximity / Ghost Mode Settings */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>👻 Privacy & Visibility</Text>
          <View style={pageStyles.card}>
            {/* Demo Mode Row */}
            <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: spacing.md, marginBottom: spacing.md }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>🚀 Demo Mode</Text>
                <Text style={styles.settingDescription}>
                  Move nearby demo users (Bob, Alice, Charlie) to your location.
                </Text>
              </View>
              {seedDemoMutation.isPending ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Switch
                  value={isDemoMode}
                  onValueChange={handleToggleDemoMode}
                  trackColor={{ false: "#767577", true: colors.primary }}
                  thumbColor="#fff"
                />
              )}
            </View>

            {/* Ghost Mode Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Ghost Mode</Text>
                <Text style={styles.settingDescription}>
                  Hide your location and posts on the radar map.
                </Text>
              </View>
              <Switch
                value={isGhostMode}
                onValueChange={setGhostMode}
                trackColor={{ false: "#767577", true: colors.accent }}
                thumbColor="#fff"
              />
            </View>

            {/* Story Bar Row */}
            <View style={[styles.settingRow, { marginTop: spacing.md }] }>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Story Bar</Text>
                <Text style={styles.settingDescription}>
                  Show or hide story bar on nearby feed.
                </Text>
              </View>
              <Switch
                value={showStoryBar}
                onValueChange={setShowStoryBar}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Global 3rd Party OAuth Accounts */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>🌐 Linked Identity Accounts (Global OAuth)</Text>
          <View style={pageStyles.card}>
            <View style={styles.oauthContainer}>
              {oauthProviders.map((p) => (
                <View key={p.key} style={styles.oauthRow}>
                  <View style={styles.oauthLeft}>
                    <View style={[styles.oauthDot, { backgroundColor: p.color === "#FFFFFF" ? "#AAA" : p.color }]} />
                    <Text style={styles.oauthName}>{p.name}</Text>
                    <Text style={styles.oauthRegion}>({p.region})</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.linkBadge}
                    onPress={() => Alert.alert("Linked", `${p.name} account is active for 1-click login.`)}
                  >
                    <Text style={styles.linkBadgeText}>✓ Linked</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Incoming Access Requests */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>🔑 Story Access Requests</Text>
          <View style={pageStyles.card}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.md }} />
            ) : incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending access requests. 🌟</Text>
              </View>
            ) : (
              incomingRequests.map((req: any) => (
                <View key={req.id} style={styles.requestItem}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarWrapper}>
                      {req.requester.profilePhotoUrl ? (
                        <Image
                          source={{ uri: req.requester.profilePhotoUrl }}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarInitial}>
                            {req.requester.username[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.username}>@{req.requester.username}</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => approveMutation.mutate(req.id)}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.denyBtn]}
                      onPress={() => denyMutation.mutate(req.id)}
                    >
                      <Text style={styles.denyBtnText}>Deny</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Account / Action Section */}
        <View style={pageStyles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>ahoj app v0.1.0 • Made with 💜</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  settingTextContainer: { flex: 1, gap: 4 },
  settingLabel: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  oauthContainer: { gap: spacing.sm },
  oauthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  oauthLeft: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  oauthDot: { width: 8, height: 8, borderRadius: 4 },
  oauthName: { color: colors.text.primary, fontSize: typography.sm, fontWeight: typography.semibold },
  oauthRegion: { color: colors.text.tertiary, fontSize: typography.xs },
  linkBadge: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  linkBadgeText: { color: colors.primary, fontSize: typography.xs, fontWeight: typography.bold },
  emptyState: { alignItems: "center", paddingVertical: spacing.md },
  emptyText: { color: colors.text.tertiary, fontSize: typography.base, fontWeight: typography.medium },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  avatarWrapper: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: { width: "100%", height: "100%", backgroundColor: colors.background.card, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: colors.text.primary, fontSize: typography.base, fontWeight: typography.bold },
  username: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.text.primary },
  actionButtons: { flexDirection: "row", gap: spacing.xs },
  actionBtn: { paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: radius.sm, justifyContent: "center", alignItems: "center" },
  approveBtn: { backgroundColor: colors.success + "22", borderWidth: 1, borderColor: colors.success },
  approveBtnText: { color: colors.success, fontSize: typography.xs, fontWeight: typography.bold },
  denyBtn: { backgroundColor: colors.error + "22", borderWidth: 1, borderColor: colors.error },
  denyBtnText: { color: colors.error, fontSize: typography.xs, fontWeight: typography.bold },
  logoutBtn: { backgroundColor: colors.error, borderRadius: radius.full, paddingVertical: 16, alignItems: "center" },
  logoutBtnText: { color: "#fff", fontSize: typography.base, fontWeight: typography.bold },
  versionText: { textAlign: "center", color: colors.text.tertiary, fontSize: typography.xs, marginTop: spacing.md },
});
