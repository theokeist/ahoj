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
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesApi } from "../../../lib/api";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import Animated, { FadeInDown } from "react-native-reanimated";

// Predefined beautiful mock story images to pick from for easy testing in Expo Go
const MOCK_STORY_TEMPLATES = [
  {
    name: "Nature 🏔️",
    url: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Coffee Vibe ☕",
    url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Concert Night 🎧",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Chill Art 🎨",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600"
  }
];

export default function StoryCreateScreen() {
  const queryClient = useQueryClient();
  const [selectedUrl, setSelectedUrl] = useState(MOCK_STORY_TEMPLATES[0].url);
  const [customUrl, setCustomUrl] = useState("");

  const uploadStoryMutation = useMutation({
    mutationFn: () =>
      storiesApi.uploadStory({
        mediaUrl: customUrl.trim() || selectedUrl,
        mediaType: "IMAGE",
      }),
    onSuccess: () => {
      // Invalidate queries to refresh feeds and user detail views
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      Alert.alert("Success", "Story uploaded successfully! It will expire in 24 hours.", [
        { text: "Cool", onPress: () => router.back() }
      ]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Story upload failed";
      Alert.alert("Error", msg);
    },
  });

  const handlePublish = () => {
    uploadStoryMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Story</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
          <Text style={styles.label}>Choose a Story Template Vibe</Text>
          <View style={styles.templateGrid}>
            {MOCK_STORY_TEMPLATES.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.templateCard,
                  selectedUrl === item.url && !customUrl && styles.templateCardActive,
                ]}
                onPress={() => {
                  setSelectedUrl(item.url);
                  setCustomUrl("");
                }}
              >
                <Text style={styles.templateEmoji}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.label}>Or Paste Custom Image URL</Text>
          <TextInput
            style={styles.input}
            value={customUrl}
            onChangeText={setCustomUrl}
            placeholder="https://images.unsplash.com/photo-..."
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.previewContainer}>
          <Text style={styles.label}>Vibe Preview</Text>
          <View style={styles.previewBox}>
            <img
              src={customUrl.trim() || selectedUrl}
              alt="Story Preview"
              style={styles.previewImage}
            />
            <View style={styles.previewOverlay}>
              <Text style={styles.previewExpires}>🕒 Expires in 24 Hours</Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[styles.publishBtn, uploadStoryMutation.isPending && styles.disabled]}
          onPress={handlePublish}
          disabled={uploadStoryMutation.isPending}
        >
          {uploadStoryMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishBtnText}>Publish Story</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: { width: 60 },
  backText: { color: colors.text.secondary, fontSize: typography.base },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  scroll: { padding: spacing.xl, gap: spacing.lg },
  section: { gap: spacing.sm },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  templateCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  templateCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  templateEmoji: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: "#fff",
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
  previewContainer: { gap: spacing.sm },
  previewBox: {
    width: "100%",
    height: 320,
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  previewOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  previewExpires: {
    color: "#fff",
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginTop: spacing.sm,
  },
  disabled: { opacity: 0.6 },
  publishBtnText: {
    color: "#fff",
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
});
