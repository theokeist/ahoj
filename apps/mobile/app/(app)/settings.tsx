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
import { colors, spacing, typography, radius, shadows } from "../../lib/theme";
import { pageStyles } from "../../lib/pageStyles";
import { Image } from "expo-image";

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const { isGhostMode, setGhostMode } = useLocationStore();
  const { showStoryBar, setShowStoryBar } = useSettingsStore();

  const [isDemoMode, setIsDemoMode] = useState(false);
  const seedDemoMutation = useMutation({
    mutationFn: () => feedApi.seedDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Demo Mode", "Demo uživatelé byli úspěšně přemístěni do tvé blízkosti! 🚀");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Chyba při spuštění demo režimu";
      Alert.alert("Chyba", msg);
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
    refetch,
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
      Alert.alert("Schváleno", "Uživatel má nyní přístup k tvým příběhům.");
    },
    onError: () => {
      Alert.alert("Chyba", "Nepodařilo se schválit žádost.");
    },
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: (requestId: string) => accessRequestsApi.deny(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      Alert.alert("Odmítnuto", "Žádost o přístup byla odmítnuta.");
    },
    onError: () => {
      Alert.alert("Chyba", "Nepodařilo se odmítnout žádost.");
    },
  });

  const { data: appInfo } = useQuery({
    queryKey: ["app-info"],
    queryFn: infoApi.getAppInfo,
  });

  const handleLogout = () => {
    Alert.alert("Odhlásit se", "Opravdu se chceš odhlásit?", [
      { text: "Zrušit", style: "cancel" },
      {
        text: "Odhlásit",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  return (
    <View style={pageStyles.screen}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={pageStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={pageStyles.backButton}>
          <Text style={pageStyles.backText}>← Zpět</Text>
        </TouchableOpacity>
        <Text style={pageStyles.headerTitle}>Nastavení</Text>
        <View style={pageStyles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={pageStyles.scrollContent}>
        {/* Proximity / Ghost Mode Settings */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>👻 Soukromí & Viditelnost</Text>
          <View style={pageStyles.card}>
            {/* Demo Mode Row */}
            <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: spacing.md, marginBottom: spacing.md }]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>🚀 Demo Režim</Text>
                <Text style={styles.settingDescription}>
                  Přemístí demo uživatele (Bob, Alice, Charlie) do tvé blízkosti.
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
                  Skryje tvůj profil a příspěvky na radarové mapě a feedu ostatních.
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
                  Zobrazit nebo skrýt lištu příběhů v feedu.
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

        {/* Incoming Access Requests */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>🔑 Žádosti o přístup k příběhům</Text>
          <View style={pageStyles.card}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.md }} />
            ) : incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Žádné čekající žádosti o přístup. 🌟</Text>
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
                      disabled={approveMutation.isPending || denyMutation.isPending}
                    >
                      <Text style={styles.approveBtnText}>Schválit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.denyBtn]}
                      onPress={() => denyMutation.mutate(req.id)}
                      disabled={approveMutation.isPending || denyMutation.isPending}
                    >
                      <Text style={styles.denyBtnText}>Odmítnout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* App Info / Legal / Open Source */}
        <View style={pageStyles.section}>
          <Text style={pageStyles.sectionTitle}>⚖️ Informace o aplikaci</Text>
          <View style={pageStyles.card}>
            {appInfo?.legal?.privacyPolicy && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoTitle}>{appInfo.legal.privacyPolicy.title}</Text>
                <Text style={styles.infoText}>{appInfo.legal.privacyPolicy.body}</Text>
              </View>
            )}
            {appInfo?.legal?.termsOfService && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoTitle}>{appInfo.legal.termsOfService.title}</Text>
                <Text style={styles.infoText}>{appInfo.legal.termsOfService.body}</Text>
              </View>
            )}
            {appInfo?.openSource && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoTitle}>{appInfo.openSource.title}</Text>
                <Text style={styles.infoText}>{appInfo.openSource.body}</Text>
                {appInfo.openSource.items?.map((item: string) => (
                  <View key={item} style={styles.tagItem}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {appInfo?.additionalSections?.map((section: any) => (
              <View key={section.title} style={styles.infoBlock}>
                <Text style={styles.infoTitle}>{section.title}</Text>
                <Text style={styles.infoText}>{section.body}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account / Action Section */}
        <View style={pageStyles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Odhlásit se</Text>
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
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.text.primary,
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  username: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: colors.success + "22", // 15% opacity green
    borderWidth: 1,
    borderColor: colors.success,
  },
  approveBtnText: {
    color: colors.success,
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  denyBtn: {
    backgroundColor: colors.error + "22", // 15% opacity red
    borderWidth: 1,
    borderColor: colors.error,
  },
  denyBtnText: {
    color: colors.error,
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  logoutBtn: {
    backgroundColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoutBtnText: {
    color: "#fff",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  infoBlock: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  infoText: {
    fontSize: typography.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  tagItem: {
    alignSelf: "flex-start",
    backgroundColor: colors.background.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.xs,
  },
  tagText: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  versionText: {
    textAlign: "center",
    color: colors.text.tertiary,
    fontSize: typography.xs,
    marginTop: spacing.md,
  },
});
