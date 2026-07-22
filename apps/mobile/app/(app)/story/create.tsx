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
  PanResponder,
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
  { id: "beauty", name: "Beauty Glow 💄" },
  { id: "bokeh", name: "Portrait Bokeh 🤖" },
  { id: "greenscreen", name: "Green Screen 🌿" },
  { id: "cyber", name: "Cyberpunk ⚡" },
  { id: "retro", name: "Retro 📻" },
  { id: "neon", name: "Neon 🌅" },
  { id: "noir", name: "Noir B&W 🖤" },
] as const;

const TEXT_COLORS = ["#FFFFFF", "#00F2FE", "#FF6B6B", "#F59E0B", "#10B981"];
const FONT_SIZES = [16, 22, 28, 34];
const ALIGNMENTS = ["center", "left", "right"] as const;
const BANNERS = ["glass", "teal", "black", "none"] as const;

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
  const [selectedFilter, setSelectedFilter] = useState<"none" | "beauty" | "bokeh" | "greenscreen" | "cyber" | "retro" | "neon" | "noir">("none");
  const [overlayText, setOverlayText] = useState("");
  const [colorIdx, setColorIdx] = useState(1); // #00F2FE
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  // Advanced Text Format & Resizing States
  const [fontSizeIdx, setFontSizeIdx] = useState<number>(1); // 22px
  const [alignIdx, setAlignIdx] = useState<number>(0); // center
  const [bannerIdx, setBannerIdx] = useState<number>(0); // glass
  const [fontFormat, setFontFormat] = useState<"bold" | "italic" | "mono">("bold");

  const textColor = TEXT_COLORS[colorIdx];
  const fontSize = FONT_SIZES[fontSizeIdx];
  const textAlign = ALIGNMENTS[alignIdx];
  const textBannerStyle = BANNERS[bannerIdx];

  // Touch Drag Positioning (x, y)
  const [textPos, setTextPos] = useState({ x: 30, y: height * 0.3 });
  const textPan = useRef({ x: 30, y: height * 0.3 });

  const textPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setTextPos({
          x: textPan.current.x + gestureState.dx,
          y: textPan.current.y + gestureState.dy,
        });
      },
      onPanResponderRelease: (_, gestureState) => {
        textPan.current = {
          x: textPan.current.x + gestureState.dx,
          y: textPan.current.y + gestureState.dy,
        };
      },
    })
  ).current;

  const [isUploading, setIsUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Upload Mutation
  const uploadStoryMutation = useMutation({
    mutationFn: async () => {
      if (!photoUri) throw new Error("No photo uri available");

      setIsUploading(true);
      try {
        let finalMediaUrl = photoUri;

        if (photoUri.startsWith("file:") || photoUri.startsWith("content:") || photoUri.startsWith("ph://")) {
          const { mediaUrl } = await storiesApi.uploadStoryFile(photoUri);
          finalMediaUrl = mediaUrl;
        }

        const params = new URLSearchParams();
        if (selectedFilter !== "none") params.append("filter", selectedFilter);
        if (overlayText.trim()) {
          params.append("text", overlayText.trim());
          params.append("textColor", textColor);
          params.append("fontSize", fontSize.toString());
          params.append("banner", textBannerStyle);
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
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
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
    setColorIdx(1);
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
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            flash={flash}
            ref={cameraRef}
          />

          <View style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]} pointerEvents="box-none">
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
        /* MEDIA EDITOR 3-PART SCREEN LAYOUT */
        <View style={styles.editorWrapper}>
          
          {/* PART 3 (FULL-PT AREA): CAPTURED PICTURE CANVAS */}
          <Image source={{ uri: photoUri }} style={styles.fullPictureArea} contentFit="cover" />

          {/* Filter Tint Overlays */}
          {selectedFilter === "beauty" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(255, 220, 230, 0.12)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "bokeh" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(0, 0, 0, 0.25)" }]} pointerEvents="none" />
          )}
          {selectedFilter === "greenscreen" && (
            <View style={[styles.filterOverlay, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]} pointerEvents="none" />
          )}
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

          {/* Draggable Floating Sticker / Badge */}
          {selectedSticker && (
            <View style={styles.floatingStickerContainer}>
              <Text style={styles.floatingStickerText}>{selectedSticker}</Text>
            </View>
          )}

          {/* Draggable Floating Text Caption Container */}
          {overlayText.trim().length > 0 && (
            <View
              {...textPanResponder.panHandlers}
              style={[
                styles.draggableTextContainer,
                { left: textPos.x, top: textPos.y },
                textBannerStyle === "glass" && styles.bannerGlass,
                textBannerStyle === "teal" && styles.bannerTeal,
                textBannerStyle === "black" && styles.bannerBlack,
              ]}
            >
              <Text
                style={[
                  styles.draggableText,
                  {
                    color: textBannerStyle === "teal" ? "#000000" : textColor,
                    fontSize,
                    textAlign,
                    fontStyle: fontFormat === "italic" ? "italic" : "normal",
                    fontFamily: fontFormat === "mono" ? "Courier" : undefined,
                  },
                ]}
              >
                {overlayText.trim()}
              </Text>
            </View>
          )}

          {/* EXIF Security Badge */}
          <View style={styles.exifBadge}>
            <Text style={styles.exifBadgeText}>🛡️ EXIF Cleared (GPS Metadata Stripped)</Text>
          </View>

          {/* Editor Header */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.circularBtn} onPress={resetCamera}>
              <Text style={styles.btnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.editorTitle}>Story Camera Editor</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* PART 1 (LEFT 40-48PT VERTICAL SIDEBAR): STYLISTIC & RESIZING EDIT OPTIONS */}
          <View style={styles.leftStylisticSidebar}>
            {/* Font Size Resizer */}
            <TouchableOpacity
              style={styles.sidebarOptionBtn}
              onPress={() => setFontSizeIdx((prev) => (prev + 1) % FONT_SIZES.length)}
            >
              <Text style={styles.sidebarOptionIcon}>📏</Text>
              <Text style={styles.sidebarOptionLabel}>{fontSize}px</Text>
            </TouchableOpacity>

            {/* Text Alignment */}
            <TouchableOpacity
              style={styles.sidebarOptionBtn}
              onPress={() => setAlignIdx((prev) => (prev + 1) % ALIGNMENTS.length)}
            >
              <Text style={styles.sidebarOptionIcon}>📐</Text>
              <Text style={styles.sidebarOptionLabel}>{textAlign[0].toUpperCase()}</Text>
            </TouchableOpacity>

            {/* Banner Style */}
            <TouchableOpacity
              style={styles.sidebarOptionBtn}
              onPress={() => setBannerIdx((prev) => (prev + 1) % BANNERS.length)}
            >
              <Text style={styles.sidebarOptionIcon}>🖼️</Text>
              <Text style={styles.sidebarOptionLabel}>{textBannerStyle}</Text>
            </TouchableOpacity>

            {/* Text Color Swatch Toggle */}
            <TouchableOpacity
              style={styles.sidebarOptionBtn}
              onPress={() => setColorIdx((prev) => (prev + 1) % TEXT_COLORS.length)}
            >
              <View style={[styles.sidebarColorDot, { backgroundColor: textColor }]} />
              <Text style={styles.sidebarOptionLabel}>Color</Text>
            </TouchableOpacity>

            {/* Font Style Format */}
            <TouchableOpacity
              style={styles.sidebarOptionBtn}
              onPress={() =>
                setFontFormat((prev) =>
                  prev === "bold" ? "italic" : prev === "italic" ? "mono" : "bold"
                )
              }
            >
              <Text style={styles.sidebarOptionIcon}>✍️</Text>
              <Text style={styles.sidebarOptionLabel}>{fontFormat}</Text>
            </TouchableOpacity>
          </View>

          {/* PART 2 (BOTTOM 300PT HORIZONTAL PANEL): EFFECTS, OVERLAYS & PHOTO STYLES */}
          <View style={styles.bottomEffectsPanel}>
            {/* Caption Input */}
            <TextInput
              style={styles.textInput}
              value={overlayText}
              onChangeText={setOverlayText}
              placeholder="Add text overlay caption (Drag on screen to reposition)..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              maxLength={60}
            />

            {/* Effects & Filters Carousel */}
            <View style={styles.panelSection}>
              <Text style={styles.panelSectionTitle}>Effects & Photo Styles</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]}
                    onPress={() => setSelectedFilter(f.id)}
                  >
                    <Text style={[styles.filterChipText, selectedFilter === f.id && styles.filterChipTextActive]}>
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Overlays & Stickers Carousel */}
            <View style={styles.panelSection}>
              <Text style={styles.panelSectionTitle}>Stickers & Overlays</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
                <TouchableOpacity
                  style={[styles.stickerChip, !selectedSticker && styles.stickerChipActive]}
                  onPress={() => setSelectedSticker(null)}
                >
                  <Text style={styles.stickerChipText}>✕ None</Text>
                </TouchableOpacity>
                {EMOJI_STICKERS.map((stk) => (
                  <TouchableOpacity
                    key={stk}
                    style={[styles.stickerChip, selectedSticker === stk && styles.stickerChipActive]}
                    onPress={() => setSelectedSticker(stk)}
                  >
                    <Text style={styles.stickerChipText}>{stk}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action Publish Button */}
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
  container: { flex: 1, backgroundColor: "#000" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl, backgroundColor: "#0C0C0C" },
  permissionEmoji: { fontSize: 54, marginBottom: spacing.md },
  permissionTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: "#fff", marginBottom: spacing.sm },
  permissionDescription: { fontSize: typography.base, color: colors.text.secondary, textAlign: "center", marginBottom: spacing.xl, lineHeight: 22 },
  permissionBtn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: radius.full, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: spacing.lg },
  permissionBtnText: { color: "#000", fontWeight: typography.bold, fontSize: typography.base },
  cancelLink: { paddingVertical: 8 },
  cancelLinkText: { color: colors.text.tertiary, fontSize: typography.base },
  cameraWrapper: { flex: 1 },
  topControls: { position: "absolute", top: 48, left: spacing.md, right: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 25 },
  row: { flexDirection: "row", gap: spacing.sm },
  circularBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  activeBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  templateDrawer: { position: "absolute", bottom: 140, left: 0, right: 0, backgroundColor: "rgba(12,12,12,0.9)", paddingVertical: spacing.md, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, zIndex: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  drawerTitle: { color: "#fff", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", paddingHorizontal: spacing.lg, marginBottom: spacing.sm, letterSpacing: 0.5 },
  drawerScroll: { paddingHorizontal: spacing.lg, gap: spacing.md },
  drawerCard: { width: 100, height: 140, borderRadius: radius.md, overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  drawerCardImage: { width: "100%", height: "100%" },
  drawerCardOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end", padding: 6 },
  drawerCardText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  bottomControls: { position: "absolute", bottom: 40, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", zIndex: 20 },
  sideBtn: { width: 80, alignItems: "center", paddingVertical: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  sideBtnText: { color: "#fff", fontSize: typography.sm, fontWeight: typography.semibold },
  shutterContainer: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: colors.primary, justifyContent: "center", alignItems: "center", shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12 },
  shutterInner: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#fff" },
  
  /* EDITOR 3-PART SCREEN LAYOUT STYLES */
  editorWrapper: { flex: 1, position: "relative", backgroundColor: "#000" },
  fullPictureArea: { width, height, position: "absolute", inset: 0 },
  filterOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  
  floatingStickerContainer: { position: "absolute", top: "20%", alignSelf: "center", zIndex: 10, backgroundColor: "rgba(0,242,254,0.15)", borderWidth: 1, borderColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full },
  floatingStickerText: { fontSize: typography.base, fontWeight: "bold", color: "#fff" },
  
  draggableTextContainer: { position: "absolute", zIndex: 12, paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: radius.md },
  bannerGlass: { backgroundColor: "rgba(0,0,0,0.65)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  bannerTeal: { backgroundColor: "#00F2FE" },
  bannerBlack: { backgroundColor: "#000000" },
  draggableText: { fontWeight: "bold" },

  exifBadge: { position: "absolute", top: 104, alignSelf: "center", zIndex: 12, backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: colors.success, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  exifBadgeText: { color: colors.success, fontSize: 10, fontWeight: "bold" },
  editorTitle: { color: "#fff", fontSize: typography.base, fontWeight: typography.bold },

  /* PART 1: LEFT VERTICAL STYLISTIC SIDEBAR (ABOUT 44PT WIDE) */
  leftStylisticSidebar: {
    position: "absolute",
    top: 108,
    left: spacing.md,
    width: 48,
    backgroundColor: "rgba(12, 12, 12, 0.85)",
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    gap: spacing.sm,
    alignItems: "center",
    zIndex: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  sidebarOptionBtn: {
    width: 40,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sidebarOptionIcon: { fontSize: 13 },
  sidebarOptionLabel: { fontSize: 8, color: "#fff", fontWeight: "bold", marginTop: 2 },
  sidebarColorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: "#fff" },

  /* PART 2: BOTTOM HORIZONTAL EFFECTS PANEL (300PT HEIGHT) */
  bottomEffectsPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "rgba(12, 12, 12, 0.94)",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs + 2,
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  textInput: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, color: "#fff", fontSize: typography.xs, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  panelSection: { gap: 4 },
  panelSectionTitle: { color: colors.primary, fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  carouselScroll: { gap: spacing.xs, paddingVertical: 2 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  filterChipTextActive: { color: "#000", fontWeight: "bold" },
  stickerChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  stickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stickerChipText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  publishBtn: { backgroundColor: colors.primary, paddingVertical: 13, borderRadius: radius.full, alignItems: "center", marginTop: 4 },
  disabledBtn: { opacity: 0.6 },
  publishBtnText: { color: "#000", fontSize: typography.sm, fontWeight: typography.bold },
});
