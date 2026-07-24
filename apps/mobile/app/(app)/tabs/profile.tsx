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
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
import { useState } from "react";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store";
import { usersApi, accessRequestsApi, storiesApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import { pageStyles } from "../../../lib/pageStyles";
import { SplitterComponent } from "../../../components/ui/SplitterComponent";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [message, setMessage] = useState(user?.message || "");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [profileTab, setProfileTab] = useState<"stories" | "sparks" | "settings" | "user" | "actions">("user");

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: usersApi.getMe,
    initialData: user || undefined,
  });

  const captureAvatar = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Chyba", "Nedostatečná oprávnění pro fotoaparát.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets?.length) {
      await Promise.all(result.assets.map((asset) => performAvatarUpload(asset.uri)));
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Chyba", "Nedostatečná oprávnění pro galerii.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets?.length) {
      await Promise.all(result.assets.map((asset) => performAvatarUpload(asset.uri)));
    }
  };

  const performAvatarUpload = async (uri: string) => {
    setIsUploadingPhoto(true);
    try {
      const { mediaUrl } = await storiesApi.uploadStoryFile(uri);
      const updated = await usersApi.updateProfile({ profilePhotoUrl: mediaUrl });
      if (profile && accessToken && refreshToken) {
        setAuth(updated, accessToken, refreshToken);
      }
      refetch();
      Alert.alert("Úspěch", "Profilová fotka byla aktualizována!");
    } catch (err) {
      Alert.alert("Chyba", "Nepodařilo se nahrát profilovou fotku.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUploadAvatar = () => {
    Alert.alert("Profilová fotka", "Vyberte zdroj fotografie", [
      { text: "Zrušit", style: "cancel" },
      { text: "Fotoaparát 📸", onPress: () => captureAvatar() },
      { text: "Galerie 🖼️", onPress: () => pickAvatar() },
    ]);
  };

  const captureAlbumPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Chyba", "Nedostatečná oprávnění pro fotoaparát.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets?.length) {
      await Promise.all(result.assets.map((asset) => performAlbumUpload(asset.uri)));
    }
  };

  const pickAlbumPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Chyba", "Nedostatečná oprávnění pro galerii.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets?.length) {
      await Promise.all(result.assets.map((asset) => performAlbumUpload(asset.uri)));
    }
  };

  const performAlbumUpload = async (uri: string) => {
    setIsUploadingAlbum(true);
    try {
      const { mediaUrl } = await storiesApi.uploadStoryFile(uri);
      const currentAlbum = profile?.photoAlbum || [];
      const updatedAlbum = [...currentAlbum, mediaUrl];
      const updated = await usersApi.updateProfile({ photoAlbum: updatedAlbum });
      if (profile && accessToken && refreshToken) {
        setAuth(updated, accessToken, refreshToken);
      }
      refetch();
      Alert.alert("Úspěch", "Fotka byla přidána do fotoalba!");
    } catch (err) {
      Alert.alert("Chyba", "Nepodařilo se přidat fotku do alba.");
    } finally {
      setIsUploadingAlbum(false);
    }
  };

  const handleAddAlbumPhoto = () => {
    Alert.alert("Přidat fotku do alba", "Vyberte zdroj fotografie", [
      { text: "Zrušit", style: "cancel" },
      { text: "Fotoaparát 📸", onPress: () => captureAlbumPhoto() },
      { text: "Galerie 🖼️", onPress: () => pickAlbumPhoto() },
    ]);
  };

  const handleDeleteAlbumPhoto = (photoIdx: number) => {
    Alert.alert("Smazat fotku", "Opravdu chcete tuto fotku smazat z fotoalba?", [
      { text: "Zrušit", style: "cancel" },
      {
        text: "Smazat 🗑️",
        style: "destructive",
        onPress: async () => {
          const currentAlbum = profile?.photoAlbum || [];
          const updatedAlbum = currentAlbum.filter((_, idx) => idx !== photoIdx);
          try {
            const updated = await usersApi.updateProfile({ photoAlbum: updatedAlbum });
            if (profile && accessToken && refreshToken) {
              setAuth(updated, accessToken, refreshToken);
            }
            refetch();
          } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se smazat fotku.");
          }
        },
      },
    ]);
  };

  const updateMessageMutation = useMutation({
    mutationFn: () => usersApi.updateMessage(message),
    onSuccess: (data: any) => {
      setIsEditingMessage(false);
      if (profile && accessToken && refreshToken) {
        setAuth({ ...profile, message: data.message }, accessToken, refreshToken);
      }
      refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to update message";
      Alert.alert("Error", msg);
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (mode: "PUBLIC" | "PRIVATE") => usersApi.updateProfile({ privacyMode: mode }),
    onSuccess: (data: any) => {
      if (profile && accessToken && refreshToken) {
        setAuth({ ...profile, privacyMode: data.privacyMode }, accessToken, refreshToken);
      }
      refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to update privacy mode";
      Alert.alert("Error", msg);
    },
  });

  const queryClient = useQueryClient();

  const { data: incomingRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["incomingRequests"],
    queryFn: accessRequestsApi.getIncoming,
    enabled: profile?.privacyMode === "PRIVATE",
  });

  const approveMutation = useMutation({
    mutationFn: accessRequestsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.error ?? "Failed to approve request");
    },
  });

  const denyMutation = useMutation({
    mutationFn: accessRequestsApi.deny,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.error ?? "Failed to deny request");
    },
  });

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of ahoj?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={pageStyles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={[pageStyles.header, { paddingTop: 12 + insets.top }]}>
        <View style={{ width: 24 }} />
        <Text style={pageStyles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <SplitterComponent
        initialRatio={0.618}
        minRatio={0.20}
        maxRatio={0.82}
        topPanel={
          <ScrollView
            contentContainerStyle={styles.splitterSubScroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Ambient Cover Banner */}
            <View style={styles.mobileCoverBanner} />

            {/* Header Row: Overlapping Avatar & Left-aligned Info */}
            <View style={styles.mobileHeaderRow}>
              <TouchableOpacity style={styles.mobileAvatarContainer} onPress={handleUploadAvatar} activeOpacity={0.8}>
                {isUploadingPhoto ? (
                  <ActivityIndicator color={colors.primary} />
                ) : profile?.profilePhotoUrl ? (
                  <Image source={{ uri: profile.profilePhotoUrl }} style={styles.mobileAvatarImage} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarText}>
                    {profile?.username ? profile.username[0].toUpperCase() : "A"}
                  </Text>
                )}
                <View style={styles.avatarEditBadge}>
                  <Text style={styles.avatarEditBadgeText}>✏️</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.mobileUserInfoColumn}>
                <View style={styles.mobileNameRow}>
                  <Text style={styles.mobileUsername}>@{profile?.username}</Text>
                  <Text style={styles.mobileVerifiedText}>✓ Verified</Text>
                </View>
                <Text style={styles.mobileLocationText}>📍 Brno Center (~0m) · Active now</Text>
                <Text style={styles.mobileIcebreakerQuote}>⚡ &ldquo;{profile?.message || "Ahoj!"}&rdquo;</Text>
              </View>
            </View>

            {/* Seamless Bio & Inline Interests Flow (No card headers or pill shapes) */}
            <View style={styles.mobileBioSection}>
              <Text style={styles.mobileBioText}>
                {profile?.bio ||
                  "Specialty coffee brewing ☕, impromptu basketball games in Brno 🏀, and synthwave beats 🎧. Always up for spontaneous coffee meetups or coding discussions!"}
              </Text>

              <Text style={styles.mobileInterestsText}>
                ☕ Specialty Coffee  •  🏀 Basketball  •  🎧 Synthwave  •  🏔️ Hiking  •  💻 React  •  ⚡ Impromptu Meetups
              </Text>
            </View>

            {/* Single Action Row */}
            <View style={styles.mobileActionRow}>
              <TouchableOpacity
                style={styles.mobilePrimaryActionBtn}
                onPress={() => router.push("/settings")}
              >
                <Text style={styles.mobilePrimaryActionText}>⚙️ Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobileSecondaryActionBtn}
                onPress={() => setIsEditingMessage(true)}
              >
                <Text style={styles.mobileSecondaryActionText}>✏️ Edit Message</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        }
        bottomPanel={
          <ScrollView
            contentContainerStyle={[styles.splitterSubScroll, { paddingBottom: 96 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Fotoalbum & Story Media */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 My Media & Stories ({profile?.photoAlbum?.length || 0}/6)</Text>
              <View style={styles.albumGrid}>
                {profile?.photoAlbum?.map((photoUrl: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.albumItem}
                    activeOpacity={0.9}
                    onPress={() => handleDeleteAlbumPhoto(idx)}
                  >
                    <Image source={{ uri: photoUrl }} style={styles.albumImage} contentFit="cover" />
                    <View style={styles.deletePhotoIndicator}>
                      <Text style={styles.deletePhotoText}>✕</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Add Photo Card */}
                {(!profile?.photoAlbum || profile.photoAlbum.length < 6) && (
                  <TouchableOpacity
                    style={styles.addPhotoCard}
                    onPress={handleAddAlbumPhoto}
                    disabled={isUploadingAlbum}
                  >
                    {isUploadingAlbum ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <Text style={styles.addPhotoIcon}>＋</Text>
                        <Text style={styles.addPhotoLabel}>Add Photo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Incoming Access Requests */}
            {profile?.privacyMode === "PRIVATE" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Incoming Access Requests</Text>
                {isRequestsLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : incomingRequests?.length === 0 ? (
                  <Text style={styles.emptyRequestsText}>No pending requests</Text>
                ) : (
                  incomingRequests?.map((req: any) => (
                    <View key={req.id} style={styles.requestItem}>
                      <View style={styles.requestUser}>
                        <View style={styles.requestAvatar}>
                          {req.requester.profilePhotoUrl ? (
                            <Image source={{ uri: req.requester.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" />
                          ) : (
                            <Text style={styles.requestAvatarText}>{req.requester.username[0].toUpperCase()}</Text>
                          )}
                        </View>
                        <Text style={styles.requestUsername}>@{req.requester.username}</Text>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.reqBtn, styles.denyBtn]}
                          onPress={() => denyMutation.mutate(req.id)}
                          disabled={denyMutation.isPending}
                        >
                          <Text style={[styles.reqBtnText, { color: colors.error }]}>Deny</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reqBtn, styles.approveBtn]}
                          onPress={() => approveMutation.mutate(req.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Text style={[styles.reqBtnText, { color: "#fff" }]}>Approve</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Public Info & Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌐 Public Info & Proximity Stats</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>⚡ Response Rate</Text>
                  <Text style={[styles.infoValue, { color: colors.primary, fontWeight: "bold" }]}>⚡ Instant (~2m)</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🔥 Proximity Streak</Text>
                  <Text style={[styles.infoValue, { color: "#FFD700", fontWeight: "bold" }]}>7 Days 🔥</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📅 Joined ahoj</Text>
                  <Text style={styles.infoValue}>July 2026</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Distance Unit</Text>
                  <Text style={styles.infoValue}>Metric (Meters)</Text>
                </View>
              </View>
            </View>

            {/* Quick Feed Actions CTA */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Quick Feed Actions</Text>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveBtn, { width: "100%", paddingVertical: 14, marginTop: 4 }]}
                onPress={() => router.push("/(app)/tabs/sparks")}
                activeOpacity={0.85}
              >
                <Text style={[styles.actionBtnText, { fontSize: 14, fontWeight: "bold" }]}>⚡ Create Spontaneous Spark</Text>
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.lg },
  splitterSubScroll: { paddingHorizontal: spacing.sm, paddingVertical: spacing.md, gap: spacing.md },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
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
    position: "relative",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarEditBadgeText: {
    fontSize: 12,
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
    width: "100%",
  },
  sectionTitle: {
    fontSize: 13,
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
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
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
  privacyDescription: {
    fontSize: typography.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text.secondary,
  },
  toggleButtonTextActive: {
    color: "#000",
    fontWeight: typography.bold,
  },
  previewTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  previewCardContainer: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
  },
  previewFeedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  previewAvatarRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  previewAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.background.card,
  },
  avatarPrivate: {
    opacity: 0.4,
  },
  previewAvatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  previewUsername: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.primary,
  },
  privateBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  privateBadgeText: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
  },
  previewMessage: {
    fontSize: typography.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  distanceContainer: {
    alignItems: "flex-end",
  },
  distance: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
    fontWeight: typography.medium,
  },
  emptyRequestsText: {
    fontSize: typography.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  requestAvatarText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  requestUsername: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.primary,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  reqBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  denyBtn: {
    borderColor: colors.error,
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  approveBtn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  reqBtnText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    width: "100%",
  },
  albumItem: {
    width: (width - spacing.sm * 2 - spacing.xs * 2 - 8) / 3,
    height: (width - spacing.sm * 2 - spacing.xs * 2 - 8) / 3,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  albumImage: {
    width: "100%",
    height: "100%",
  },
  deletePhotoIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deletePhotoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  addPhotoCard: {
    width: (width - spacing.sm * 2 - spacing.xs * 2 - 8) / 3,
    height: (width - spacing.sm * 2 - spacing.xs * 2 - 8) / 3,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addPhotoIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  addPhotoLabel: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  segmentSplitter: {
    flexDirection: "row",
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.md,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  segmentText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: "#0C0C0C",
    fontWeight: typography.black,
  },

  // ── Mobile Profile Restyled Full-Width Components & Optimized Typography ──
  mobileCoverBanner: {
    width: "100%",
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: -42,
  },
  mobileHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  mobileAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.background.primary,
    backgroundColor: colors.background.card,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  mobileAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg - 3,
  },
  mobileUserInfoColumn: {
    flex: 1,
    paddingTop: 44,
    gap: 3,
  },
  mobileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mobileUsername: {
    fontSize: typography.lg,
    fontWeight: "800",
    color: colors.text.primary,
  },
  mobileVerifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  mobileLocationText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  mobileIcebreakerQuote: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.text.primary,
    marginTop: 4,
    lineHeight: 20,
  },
  mobileBioSection: {
    width: "100%",
    paddingHorizontal: 4,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.xs,
  },
  mobileBioText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.secondary,
    fontWeight: "400",
  },
  mobileInterestsText: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 22,
    fontWeight: "600",
  },
  mobileActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 4,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.md,
  },
  mobilePrimaryActionBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  mobilePrimaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0C0C0C",
  },
  mobileSecondaryActionBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  mobileSecondaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
});
