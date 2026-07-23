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

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatar} onPress={handleUploadAvatar} activeOpacity={0.8}>
            {isUploadingPhoto ? (
              <ActivityIndicator color={colors.primary} />
            ) : profile?.profilePhotoUrl ? (
              <Image source={{ uri: profile.profilePhotoUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={styles.avatarText}>
                {profile?.username ? profile.username[0].toUpperCase() : "A"}
              </Text>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {profile?.privacyMode === "PUBLIC" ? "🔓 Public" : "🔒 Private"}
            </Text>
          </View>
        </View>

        {/* Ant Design Mobile Two-Part Splitter */}
        <View style={styles.segmentSplitter}>
          {[
            { id: "user", label: "👤 User Profile" },
            { id: "actions", label: "⚡ Feed Actions" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setProfileTab(tab.id as any)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[
                styles.segmentItem,
                (profileTab === tab.id || (profileTab === "stories" && tab.id === "user") || (profileTab === "sparks" && tab.id === "actions")) && styles.segmentItemActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  (profileTab === tab.id || (profileTab === "stories" && tab.id === "user") || (profileTab === "sparks" && tab.id === "actions")) && styles.segmentTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PART 1: USER PROFILE & SETTINGS */}
        {(profileTab === "user" || profileTab === "stories") && (
          <>
            {/* Icebreaker Message Editor */}
            <View style={styles.section}>
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
            </View>

            {/* Privacy Settings & Live Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Mode</Text>
              <Text style={styles.privacyDescription}>
                In Private Mode, other users must request permission to view your stories. Your icebreaker message remains visible, but your avatar is blurred/hidden in the feed.
              </Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    profile?.privacyMode === "PUBLIC" && styles.toggleButtonActive,
                  ]}
                  onPress={() => updatePrivacyMutation.mutate("PUBLIC")}
                  disabled={updatePrivacyMutation.isPending}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      profile?.privacyMode === "PUBLIC" && styles.toggleButtonTextActive,
                    ]}
                  >
                    🔓 Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    profile?.privacyMode === "PRIVATE" && styles.toggleButtonActive,
                  ]}
                  onPress={() => updatePrivacyMutation.mutate("PRIVATE")}
                  disabled={updatePrivacyMutation.isPending}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      profile?.privacyMode === "PRIVATE" && styles.toggleButtonTextActive,
                    ]}
                  >
                    🔒 Private
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Live Preview: How others see you */}
              <Text style={styles.previewTitle}>How others see you in the feed</Text>
              <View style={styles.previewCardContainer}>
                <View style={styles.previewFeedItem}>
                  {/* Avatar */}
                  <View style={styles.avatarWrapper}>
                    <View style={[styles.previewAvatarRing, { borderColor: colors.borderLight }]} />
                    <View style={[styles.previewAvatar, profile?.privacyMode === "PRIVATE" && styles.avatarPrivate]}>
                      {profile?.profilePhotoUrl && profile?.privacyMode === "PUBLIC" ? (
                        <Image
                          source={{ uri: profile.profilePhotoUrl }}
                          style={styles.previewAvatarImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarInitial}>
                            {profile?.username ? profile.username[0].toUpperCase() : "A"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                      <Text style={styles.previewUsername}>{profile?.username}</Text>
                      {profile?.privacyMode === "PRIVATE" && (
                        <View style={styles.privateBadge}>
                          <Text style={styles.privateBadgeText}>🔒 Private</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.previewMessage} numberOfLines={2}>
                      {profile?.message || "No message set"}
                    </Text>
                  </View>

                  {/* Distance */}
                  <View style={styles.distanceContainer}>
                    <Text style={styles.distance}>~120 m</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Info Details */}
            <View style={styles.section}>
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
            </View>

            {/* Log Out CTA */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutText}>🚪 Sign Out of ahoj</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* PART 2: FEED ACTIONS & MEDIA */}
        {(profileTab === "actions" || profileTab === "sparks") && (
          <>
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
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text.secondary,
  },
  toggleButtonTextActive: {
    color: "#fff",
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
    width: (width - spacing.xl * 2 - spacing.sm * 2) / 3,
    height: (width - spacing.xl * 2 - spacing.sm * 2) / 3,
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
});
