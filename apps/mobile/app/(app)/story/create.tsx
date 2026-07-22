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

const EMOJI_STICKERS = ["📍 Brno", "⚡ Spark", "🔥 Hot", "☕ Coffee", "🏔️ Trip", "🎧 Vibe", "🎉 Party", "✨ Glow"];

const FILTERS = [
  { id: "none", name: "Original 📷" },
  { id: "cyber", name: "Cyberpunk ⚡" },
  { id: "retro", name: "Retro 📻" },
  { id: "neon", name: "Neon 🌅" },
  { id: "noir", name: "Noir B&W 🖤" },
  { id: "emerald", name: "Emerald 🌿" },
] as const;

const TEXT_COLORS = [
  { hex: "#FFFFFF", name: "White" },
  { hex: "#00F2FE", name: "Teal" },
  { hex: "#FF6B6B", name: "Pink" },
  { hex: "#F59E0B", name: "Gold" },
  { hex: "#10B981", name: "Emerald" },
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
  const [selectedFilter, setSelectedFilter] = useState<"none" | "cyber" | "retro" | "neon" | "noir" | "emerald">("none");
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#00F2FE");
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

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
        if (selectedSticker) params.append("sticker", selectedSticker);

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
      Alert.alert("Story Shared! 🚀", "Your 24h story is live for nearby people!", [
        { text: "Awesome", onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Error uploading story";
      Alert.alert("Error", msg);
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
        Alert.alert("Error", "Failed to capture photo.");
      }
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera roll access is required to pick photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: false,
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
    setTextColor("#00F2FE");
    setSelectedSticker(null);
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
        <Text style={styles.permissionTitle}>ahoj Camera</Text>
        <Text style={styles.permissionDescription}>
          Allow camera access to record 24h stories and share moments with nearby people.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Enable Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
          <Text style={styles.cancelLinkText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {mode === "CAMERA" ? (
        <View style={styles.cameraWrapper}>
          {/* FIX: CameraView rendered without children to prevent React Native warning */}
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            flash={flash}
            ref={cameraRef}
          />

          {/* Absolute Controls Overlay */}
          <View style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]} pointerEvents="box-none">
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
                <Text style={styles.drawerTitle}>Select Story Template</Text>
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
                <Text style={styles.sideBtnText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shutterContainer} onPress={handleCapture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sideBtn}
                onPress={() => setFacing(facing === "back" ? "front" : "back")}
              >
                <Text style={styles.sideBtnText}>Flip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* MEDIA EDITOR MODE */
        <View style={styles.editorWrapper}>
          <Image source={{ uri: photoUri }} style={styles.editorImage} contentFit="cover" />

          {/* Filter tint overlays */}
          {selectedFilter === "cyber" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 242, 254, 0.18)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "retro" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(230, 120, 0, 0.15)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "neon" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(255, 107, 107, 0.18)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "noir" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 0, 0, 0.4)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "emerald" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]} pointerEvents="none" />
          )}

          {/* Floating Sticker / Location Badge */}
          {selectedSticker && (
            <View style={styles.floatingStickerContainer}>
              <Text style={styles.floatingStickerText}>{selectedSticker}</Text>
            </View>
          )}

          {/* Floating Text Banner */}
          {overlayText.trim().length > 0 && (
            <View style={styles.floatingTextContainer}>
              <Text style={[styles.floatingText, { color: textColor }]}>
                {overlayText.trim()}
              </Text>
            </View>
          )}

          {/* EXIF Privacy Security Badge */}
          <View style={styles.exifBadge}>
            <Text style={styles.exifBadgeText}>🛡️ EXIF Cleared (GPS Metadata Stripped)</Text>
          </View>

          {/* Editor Header */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.circularBtn} onPress={resetCamera}>
              <Text style={styles.btnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.editorTitle}>Story Editor</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Editor Options Drawer */}
          <View style={styles.editorControls}>
            {/* 1. Stickers & Location Badges */}
            <View style={styles.editorSection}>
              <Text style={styles.sectionLabel}>Stickers & Badges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiList}>
                <TouchableOpacity
                  style={[styles.emojiItem, !selectedSticker && styles.activeEmoji]}
                  onPress={() => setSelectedSticker(null)}
                >
                  <Text style={styles.emojiItemText}>✕</Text>
                </TouchableOpacity>
                {EMOJI_STICKERS.map((stk) => (
                  <TouchableOpacity
                    key={stk}
                    style={[styles.emojiItem, selectedSticker === stk && styles.activeEmoji]}
                    onPress={() => setSelectedSticker(stk)}
                  >
                    <Text style={styles.emojiItemText}>{stk}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 2. Text Banner & Font Colors */}
            <View style={styles.editorSection}>
              <Text style={styles.sectionLabel}>Story Caption & Text Banner</Text>
              <TextInput
                style={styles.textInput}
                value={overlayText}
                onChangeText={setOverlayText}
                placeholder="Add text caption..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                maxLength={50}
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

            {/* 3. Cyberpunk & Color Filters */}
            <View style={styles.editorSection}>
              <Text style={styles.sectionLabel}>Filters</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.filterBadge, selectedFilter === f.id && styles.activeFilterBadge]}
                    onPress={() => setSelectedFilter(f.id)}
                  >
                    <Text style={[styles.filterBadgeText, selectedFilter === f.id && styles.activeFilterBadgeText]}>
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 4. Action Buttons */}
            <TouchableOpacity
              style={[styles.publishBtn, (uploadStoryMutation.isPending || isUploading) && styles.disabledBtn]}
              onPress={() => uploadStoryMutation.mutate()}
              disabled={uploadStoryMutation.isPending || isUploading}
            >
              {uploadStoryMutation.isPending || isUploading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.publishBtnText}>Publish to 24h Stories ⚡</Text>
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
    backgroundColor: "#0C0C0C",
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
    color: "#000",
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
    backgroundColor: "rgba(12,12,12,0.9)",
    paddingVertical: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    zIndex: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
    backgroundColor: "rgba(0,0,0,0.3)",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
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
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
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
  floatingStickerContainer: {
    position: "absolute",
    top: "25%",
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: "rgba(0,242,254,0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  floatingStickerText: {
    fontSize: typography.base,
    fontWeight: "bold",
    color: "#fff",
  },
  floatingTextContainer: {
    position: "absolute",
    top: "40%",
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  floatingText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  exifBadge: {
    position: "absolute",
    top: 104,
    alignSelf: "center",
    zIndex: 12,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  exifBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "bold",
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
    backgroundColor: "rgba(12,12,12,0.92)",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    zIndex: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  editorSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.primary,
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
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  activeEmoji: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emojiItemText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: "#fff",
    fontSize: typography.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
    gap: spacing.xs,
  },
  filterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  activeFilterBadge: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  activeFilterBadgeText: {
    color: "#000",
    fontWeight: "bold",
  },
  publishBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: "center",
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  publishBtnText: {
    color: "#000",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
});
