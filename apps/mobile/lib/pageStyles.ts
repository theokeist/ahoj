import { StyleSheet } from "react-native";
import { colors, spacing, typography, radius, shadows } from "./theme";

export const pageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    minWidth: 60,
    alignItems: "flex-start",
  },
  backText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
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
});
