import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { sparksApi } from "../../../lib/api";
import { useLocationStore, useAuthStore } from "../../../store";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import type { SparkPublic } from "@ahoj/shared";

export default function SparksScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { lat, lng } = useLocationStore();
  const me = useAuthStore((s) => s.user);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"COFFEE" | "SPORTS" | "PARTY" | "STUDY" | "MEETUP" | "OTHER">("MEETUP");
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});

  // Query nearby sparks
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["sparks", lat, lng],
    queryFn: () => sparksApi.getSparks({ lat: lat ?? 49.1951, lng: lng ?? 16.6079, radius: 5 }),
  });

  const sparksList: SparkPublic[] = data?.sparks ?? [];

  const filteredSparks = activeCategory === "ALL"
    ? sparksList
    : sparksList.filter((s) => s.category === activeCategory);

  // Create Spark Mutation
  const createSparkMutation = useMutation({
    mutationFn: () =>
      sparksApi.createSpark({
        title,
        description,
        category,
        lat: lat ?? 49.1951,
        lng: lng ?? 16.6079,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sparks"] });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      Alert.alert("Spark Live! ⚡", "Your spontaneous meetup ping is live for 2 hours!");
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.error ?? "Failed to create spark");
    },
  });

  const toggleRsvp = (id: string) => {
    setRsvps((prev) => {
      const next = !prev[id];
      Alert.alert(next ? "RSVP Confirmed! 🎉" : "RSVP Cancelled", next ? "The host has been notified." : "");
      return { ...prev, [id]: next };
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "COFFEE": return "☕";
      case "SPORTS": return "⚽";
      case "PARTY": return "🎉";
      case "STUDY": return "📚";
      case "MEETUP": return "🤝";
      default: return "⚡";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 + insets.top }]}>
        <View>
          <Text style={styles.headerTitle}>⚡ Sparks</Text>
          <Text style={styles.headerSubtitle}>Spontaneous meetups in your area</Text>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {["ALL", "COFFEE", "SPORTS", "PARTY", "STUDY", "MEETUP"].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>
                {cat === "ALL" ? "✨ All" : `${getCategoryIcon(cat)} ${cat}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Feed */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSparks}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          contentContainerStyle={[styles.list, { paddingBottom: 96 + insets.bottom }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>⚡</Text>
              <Text style={styles.emptyTitle}>No active sparks nearby</Text>
              <Text style={styles.emptyText}>Be the first to post a spontaneous meetup ping in your circle!</Text>
              <TouchableOpacity style={styles.emptyCreateBtn} onPress={() => setIsModalOpen(true)}>
                <Text style={styles.emptyCreateBtnText}>+ Post a Spark</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.sparkCard}>
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  {item.userAvatarUrl ? (
                    <Image source={{ uri: item.userAvatarUrl }} style={styles.avatar} contentFit="cover" />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{item.username[0].toUpperCase()}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.username}>@{item.username}</Text>
                    <Text style={styles.distance}>~{item.distanceMeters}m away</Text>
                  </View>
                </View>

                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{getCategoryIcon(item.category)} {item.category}</Text>
                </View>
              </View>

              <Text style={styles.sparkTitle}>{item.title}</Text>
              {item.description && <Text style={styles.sparkDesc}>{item.description}</Text>}

              <View style={styles.cardFooter}>
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>⏳ Expires in 2h</Text>
                </View>

                <TouchableOpacity
                  style={[styles.rsvpBtn, rsvps[item.id] && styles.rsvpBtnActive]}
                  onPress={() => toggleRsvp(item.id)}
                >
                  <Text style={[styles.rsvpBtnText, rsvps[item.id] && styles.rsvpBtnTextActive]}>
                    {rsvps[item.id] ? "✓ I'm In!" : "⚡ Join Spark"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Create Spark Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalOpen(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>⚡ Create Spontaneous Spark</Text>
            <Text style={styles.modalSubtitle}>Post a 2-hour ping for nearby people to join</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Coffee at Cafe Nero?"
                placeholderTextColor={colors.text.tertiary}
                maxLength={60}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Looking for 2 people to hang out..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                maxLength={200}
              />
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {(["COFFEE", "SPORTS", "PARTY", "STUDY", "MEETUP", "OTHER"] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                >
                  <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextActive]}>
                    {getCategoryIcon(cat)} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, createSparkMutation.isPending && styles.btnDisabled]}
              disabled={createSparkMutation.isPending || !title.trim()}
              onPress={() => createSparkMutation.mutate()}
            >
              {createSparkMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitBtnText}>Publish Spark (2h Expiry)</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.black, color: colors.text.primary },
  headerSubtitle: { fontSize: typography.xs, color: colors.text.secondary },
  createBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createBtnText: { color: "#000", fontSize: typography.sm, fontWeight: typography.bold },
  filterBar: { borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingVertical: spacing.sm },
  filterScroll: { paddingHorizontal: spacing.xl, gap: spacing.xs },
  filterChip: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: typography.xs, color: colors.text.secondary, fontWeight: typography.medium },
  filterChipTextActive: { color: "#000", fontWeight: typography.bold },
  list: { padding: spacing.xl, gap: spacing.md },
  loadingState: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", padding: spacing.xl, gap: spacing.sm, marginTop: spacing.xxl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.text.primary },
  emptyText: { fontSize: typography.sm, color: colors.text.secondary, textAlign: "center" },
  emptyCreateBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, marginTop: spacing.sm },
  emptyCreateBtnText: { color: "#000", fontWeight: typography.bold, fontSize: typography.sm },
  sparkCard: {
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: colors.primary, fontWeight: typography.bold },
  username: { color: colors.text.primary, fontSize: typography.sm, fontWeight: typography.semibold },
  distance: { color: colors.primary, fontSize: typography.xs, fontWeight: typography.medium },
  categoryBadge: { backgroundColor: colors.glass, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  categoryText: { color: colors.primary, fontSize: typography.xs, fontWeight: typography.bold },
  sparkTitle: { color: colors.text.primary, fontSize: typography.base, fontWeight: typography.bold },
  sparkDesc: { color: colors.text.secondary, fontSize: typography.sm },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing.xs },
  timerBadge: { backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  timerText: { color: colors.text.tertiary, fontSize: typography.xs },
  rsvpBtn: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full },
  rsvpBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rsvpBtnText: { color: colors.primary, fontSize: typography.xs, fontWeight: typography.bold },
  rsvpBtnTextActive: { color: "#000" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.background.primary, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.text.primary },
  modalSubtitle: { fontSize: typography.xs, color: colors.text.secondary, marginTop: -spacing.xs },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.text.secondary },
  input: { backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: typography.base, color: colors.text.primary },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  categoryOption: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.borderLight },
  categoryOptionActive: { backgroundColor: colors.primary },
  categoryOptionText: { fontSize: typography.xs, color: colors.text.secondary },
  categoryOptionTextActive: { color: "#000", fontWeight: typography.bold },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: "center", marginTop: spacing.sm },
  submitBtnText: { color: "#000", fontWeight: typography.bold, fontSize: typography.base },
  btnDisabled: { opacity: 0.5 },
});
