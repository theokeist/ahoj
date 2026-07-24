import React from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { colors, spacing, typography, radius } from "../../lib/theme";

/* ── 1. FormGroup Container ────────────────────────────────────────── */
interface FormGroupProps {
  title?: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
}

export function FormGroup({ title, description, icon, children }: FormGroupProps) {
  return (
    <View style={styles.groupContainer}>
      {title && (
        <View style={styles.headerRow}>
          {icon && <Text style={styles.headerIcon}>{icon}</Text>}
          <Text style={styles.groupTitle}>{title}</Text>
        </View>
      )}
      {description && <Text style={styles.groupDescription}>{description}</Text>}
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

/* ── 2. FormInput Component ────────────────────────────────────────── */
interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  icon?: string;
}

export function FormInput({ label, error, helperText, icon, style, ...rest }: FormInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelRow}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.inputField, error ? styles.inputFieldError : null, style]}
        placeholderTextColor={colors.text.tertiary}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

/* ── 3. FormSwitch Component ───────────────────────────────────────── */
interface FormSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  icon?: string;
  disabled?: boolean;
}

export function FormSwitch({
  label,
  description,
  value,
  onValueChange,
  icon,
  disabled,
}: FormSwitchProps) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchTextContainer}>
        <View style={styles.switchLabelRow}>
          {icon && <Text style={styles.switchIcon}>{icon}</Text>}
          <Text style={styles.switchLabel}>{label}</Text>
        </View>
        {description && <Text style={styles.switchDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "rgba(255,255,255,0.15)", true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

/* ── 4. FormSegmented Component ────────────────────────────────────── */
interface FormSegmentedOption<T extends string> {
  id: T;
  label: string;
  icon?: string;
}

interface FormSegmentedProps<T extends string> {
  options: FormSegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  label?: string;
}

export function FormSegmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: FormSegmentedProps<T>) {
  return (
    <View style={styles.segmentedWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={styles.segmentedContainer}>
        {options.map((opt) => {
          const isActive = opt.id === value;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onChange(opt.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={[styles.segmentedOption, isActive && styles.segmentedOptionActive]}
            >
              {opt.icon && (
                <Text style={[styles.segmentedIcon, isActive && styles.segmentedIconActive]}>
                  {opt.icon}
                </Text>
              )}
              <Text style={[styles.segmentedText, isActive && styles.segmentedTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ── 5. FormChipGroup Component ────────────────────────────────────── */
interface FormChipOption<T extends string> {
  id: T;
  label: string;
}

interface FormChipGroupProps<T extends string> {
  options: FormChipOption<T>[];
  value: T;
  onChange: (val: T) => void;
  label?: string;
}

export function FormChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: FormChipGroupProps<T>) {
  return (
    <View style={styles.chipGroupWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={styles.chipContainer}>
        {options.map((opt) => {
          const isActive = opt.id === value;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onChange(opt.id)}
              activeOpacity={0.75}
              style={[styles.chipItem, isActive && styles.chipItemActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 14,
  },
  groupTitle: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  groupDescription: {
    fontSize: typography.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  groupCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.md,
  },

  /* Input */
  inputWrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inputIcon: {
    fontSize: 12,
  },
  inputLabel: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputField: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: typography.sm,
  },
  inputFieldError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.xs,
    color: colors.error,
    fontWeight: typography.semibold,
  },
  helperText: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
  },

  /* Switch */
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  switchIcon: {
    fontSize: 14,
  },
  switchLabel: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  switchDescription: {
    fontSize: typography.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  /* Segmented */
  segmentedWrapper: {
    gap: 6,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radius.md,
    padding: 3,
  },
  segmentedOption: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: radius.sm,
  },
  segmentedOptionActive: {
    backgroundColor: colors.primary,
  },
  segmentedIcon: {
    fontSize: 12,
  },
  segmentedIconActive: {
    color: "#000",
  },
  segmentedText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.text.secondary,
  },
  segmentedTextActive: {
    color: "#000000",
    fontWeight: typography.bold,
  },

  /* Chips */
  chipGroupWrapper: {
    gap: 6,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipItemActive: {
    backgroundColor: "rgba(0,242,254,0.15)",
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.xs,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
});
