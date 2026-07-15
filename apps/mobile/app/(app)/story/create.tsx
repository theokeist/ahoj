import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";
import { useState, useRef } from "react";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { storiesApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

const MOCK_STORY_TEMPLATES = [
  {
    name: "Nature 🏔️",
    url: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Coffee ☕",
    url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Concert 🎧",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Chill Art 🎨",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
  },
];

const EMOJI_STICKERS = ["🔥", "☕", "📍", "🍻", "🍿", "🎵", "✨", "❤️", "🙌", "🎉"];

const FILTERS = [
  { id: "none", name: "Original 📷" },
  { id: "retro", name: "Retro 📻" },
  { id: "neon", name: "Neon 🦄" },
  { id: "moody", name: "Moody 🖤" },
  { id: "sunset", name: "Sunset 🌅" },
] as const;

const TEXT_COLORS = [
  { hex: "#FFFFFF", name: "Bílá" },
  { hex: "#FF6B6B", name: "Růžová" },
  { hex: "#10B981", name: "Zelená" },
  { hex: "#F59E0B", name: "Žlutá" },
  { hex: "#3B82F6", name: "Modrá" },
];

export default function StoryCreateScreen() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"CAMERA" | "EDITOR">("CAMERA");

  // Camera permissions and configuration
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const cameraRef = useRef<any>(null);

  // Editor states
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"none" | "retro" | "neon" | "moody" | "sunset">("none");
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Mutations
  const uploadStoryMutation = useMutation({
    mutationFn: async () => {
      if (!photoUri) throw new Error("No photo uri available");

      setIsUploading(true);
      try {
        let finalMediaUrl = photoUri;

        // If local file, upload it
        if (photoUri.startsWith("file:") || photoUri.startsWith("content:") || photoUri.startsWith("ph://")) {
          const { mediaUrl } = await storiesApi.uploadStoryFile(photoUri);
          finalMediaUrl = mediaUrl;
        }

        // Build parameters query string to save overlay edits
        const params = new URLSearchParams();
        if (selectedFilter !== "none") params.append("filter", selectedFilter);
        if (overlayText.trim()) {
          params.append("text", overlayText.trim());
          params.append("textColor", textColor);
        }
        if (selectedEmoji) params.append("emoji", selectedEmoji);

        const queryString = params.toString();
        const fullMediaUrl = queryString ? `${finalMediaUrl}?${queryString}` : finalMediaUrl;

        return storiesApi.uploadStory({
          mediaUrl: fullMediaUrl,
          mediaType: "IMAGE",
        });
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Success", "Příběh byl úspěšně sdílen! 🌟", [
        { text: "Skvělé", onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Chyba při nahrávání příběhu";
      Alert.alert("Chyba", msg);
    },
  });

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo && photo.uri) {
          setPhotoUri(photo.uri);
          setMode("EDITOR");
        }
      } catch (err) {
        Alert.alert("Chyba", "Nepodařilo se pořídit fotografii.");
      }
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Povolení zamítnuto", "K výběru fotek z galerie potřebujeme vaše svolení.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const firstAsset = result.assets[0];
      setPhotoUri(firstAsset.uri);
      setMode("EDITOR");
    }
  };

  const handlePickTemplate = (url: string) => {
    setPhotoUri(url);
    setMode("EDITOR");
    setShowTemplates(false);
  };

  const resetCamera = () => {
    setPhotoUri(null);
    setSelectedFilter("none");
    setOverlayText("");
    setTextColor("#FFFFFF");
    setSelectedEmoji(null);
    setMode("CAMERA");
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.permissionEmoji}>📸</Text>
        <Text style={styles.permissionTitle}>Ahoj Příběhy</Text>
        <Text style={styles.permissionDescription}>
          Chceš-li zachytit zajímavé momenty a sdílet je s lidmi v okolí, povol přístup k fotoaparátu.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Povolit přístup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
          <Text style={styles.cancelLinkText}>Zavřít</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {mode === "CAMERA" ? (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            flash={flash}
            ref={cameraRef}
          >
            {/* Top controls overlay */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.circularBtn} onPress={() => router.back()}>
                <Text style={styles.btnText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.circularBtn}
                  onPress={() => setFlash(flash === "off" ? "on" : flash === "on" ? "auto" : "off")}
                >
                  <Text style={styles.btnText}>
                    {flash === "off" ? "⚡ Off" : flash === "on" ? "⚡ On" : "⚡ Auto"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.circularBtn, showTemplates && styles.activeBtn]}
                  onPress={() => setShowTemplates(!showTemplates)}
                >
                  <Text style={styles.btnText}>🖼️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Template Drawer */}
            {showTemplates && (
              <View style={styles.templateDrawer}>
                <Text style={styles.drawerTitle}>Vyber šablonu</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drawerScroll}>
                  {MOCK_STORY_TEMPLATES.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={styles.drawerCard}
                      onPress={() => handlePickTemplate(item.url)}
                    >
                      <Image source={{ uri: item.url }} style={styles.drawerCardImage} />
                      <View style={styles.drawerCardOverlay}>
                        <Text style={styles.drawerCardText}>{item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bottom Shutter & controls overlay */}
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.sideBtn} onPress={handlePickFromGallery}>
                <Text style={styles.sideBtnText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shutterContainer} onPress={handleCapture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sideBtn}
                onPress={() => setFacing(facing === "back" ? "front" : "back")}
              >
                <Text style={styles.sideBtnText}>Otočit</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        /* EDITOR MODE */
        <View style={styles.editorWrapper}>
          <Image source={{ uri: photoUri }} style={styles.editorImage} contentFit="cover" />

          {/* Filter tint overlays */}
          {selectedFilter === "retro" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(230, 120, 0, 0.12)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "neon" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(200, 0, 200, 0.12)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "moody" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 0, 0, 0.35)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "sunset" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(255, 100, 0, 0.15)" }]} pointerEvents="none" />
          )}

          {/* Live floating stickers and text previews */}
          {selectedEmoji && (
            <View style={styles.floatingEmojiContainer}>
              <Text style={styles.floatingEmoji}>{selectedEmoji}</Text>
            </View>
          )}

          {overlayText.trim().length > 0 && (
            <View style={styles.floatingTextContainer}>
              <Text style={[styles.floatingText, { color: textColor }]}>
                {overlayText.trim()}
              </Text>
            </View>
          )}

          {/* Editor Header */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.circularBtn} onPress={resetCamera}>
              <Text style={styles.btnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.editorTitle}>Upravit Příběh</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Editor Options Scroll */}
          <View style={styles.editorControls}>
            {/* 1. Emoji Selection Row */}
            <View style={styles.editorSection}>
              <Text style={styles.sectionLabel}>Nálepka (Emoji)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiList}>
                <TouchableOpacity
                  style={[styles.emojiItem, !selectedEmoji && styles.activeEmoji]}
                  onPress={() => setSelectedEmoji(null)}
                >
                  <Text style={styles.emojiItemText}>✕</Text>
                </TouchableOpacity>
                {EMOJI_STICKERS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiItem, selectedEmoji === emoji && styles.activeEmoji]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiItemText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 2. Text Input & Colors */}
            <View style={styles.editorSection}>
              <Text style={styles.sectionLabel}>Text na fotce</Text>
              <TextInput
                style={styles.textInput}
                value={overlayText}
                onChangeText={setOverlayText}
                placeholder="Napiš něco k fotce..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                maxLength={45}
              />
              <View style={styles.colorRow}>
                {TEXT_COLORS.map((col) => (
                  <TouchableOpacity
                    key={col.hex}
                    style={[
                      styles.colorBall,
                      { backgroundColor: col.hex },
                      textColor === col.hex && styles.activeColorBall,
                    ]}
                    onPress={() => setTextColor(col.hex)}
                  />
                ))}
              </View>
            </View>

            {/* 3. Filters */}
            <View style={styles.editorSection}>
              <Text style={styles.sectionLabel}>Filtry</Text>
              <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.filterBadge, selectedFilter === f.id && styles.activeFilterBadge]}
                    onPress={() => setSelectedFilter(f.id)}
                  >
                    <Text style={styles.filterBadgeText}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 4. Action Buttons */}
            <TouchableOpacity
              style={[styles.publishBtn, (uploadStoryMutation.isPending || isUploading) && styles.disabledBtn]}
              onPress={() => uploadStoryMutation.mutate()}
              disabled={uploadStoryMutation.isPending || isUploading}
            >
              {uploadStoryMutation.isPending || isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.publishBtnText}>Sdílet do Příběhů 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "#1A0A2E",
  },
  permissionEmoji: {
    fontSize: 54,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: "#fff",
    marginBottom: spacing.sm,
  },
  permissionDescription: {
    fontSize: typography.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: spacing.lg,
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: typography.bold,
    fontSize: typography.base,
  },
  cancelLink: {
    paddingVertical: 8,
  },
  cancelLinkText: {
    color: colors.text.tertiary,
    fontSize: typography.base,
  },
  cameraWrapper: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  circularBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  activeBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  templateDrawer: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    backgroundColor: "rgba(26,10,46,0.85)",
    paddingVertical: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    zIndex: 20,
  },
  drawerTitle: {
    color: "#fff",
    fontSize: typography.xs,
    fontWeight: typography.bold,
    textTransform: "uppercase",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  drawerScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  drawerCard: {
    width: 100,
    height: 140,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  drawerCardImage: {
    width: "100%",
    height: "100%",
  },
  drawerCardOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    padding: 6,
  },
  drawerCardText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 20,
  },
  sideBtn: {
    width: 80,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: radius.md,
  },
  sideBtnText: {
    color: "#fff",
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  shutterContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff",
  },
  editorWrapper: {
    flex: 1,
    position: "relative",
  },
  editorImage: {
    width: width,
    height: height,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  floatingEmojiContainer: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    zIndex: 10,
  },
  floatingEmoji: {
    fontSize: 72,
  },
  floatingTextContainer: {
    position: "absolute",
    top: "45%",
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  floatingText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  editorTitle: {
    color: "#fff",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  editorControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    zIndex: 15,
  },
  editorSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emojiList: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  emojiItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activeEmoji: {
    backgroundColor: colors.primary,
    borderColor: "#fff",
  },
  emojiItemText: {
    fontSize: 18,
    color: "#fff",
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: "#fff",
    fontSize: typography.sm,
  },
  colorRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: 6,
  },
  colorBall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  activeColorBall: {
    borderColor: "#fff",
    transform: [{ scale: 1.15 }],
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  filterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeFilterBadge: {
    backgroundColor: colors.primary,
    borderColor: "rgba(255,255,255,0.3)",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  publishBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  publishBtnText: {
    color: "#fff",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
});
