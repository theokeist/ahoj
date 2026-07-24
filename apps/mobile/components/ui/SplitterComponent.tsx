import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  LayoutChangeEvent,
  ViewStyle,
  Platform,
} from "react-native";
import { colors, spacing, typography, radius } from "../../lib/theme";

interface SplitterComponentProps {
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
  initialRatio?: number; // e.g. 0.42 (42% top, 58% bottom)
  minRatio?: number;    // e.g. 0.20
  maxRatio?: number;    // e.g. 0.75
  style?: ViewStyle;
}

export function SplitterComponent({
  topPanel,
  bottomPanel,
  initialRatio = 0.618,
  minRatio = 0.20,
  maxRatio = 0.82,
  style,
}: SplitterComponentProps) {
  const [splitRatio, setSplitRatio] = useState<number>(initialRatio);
  const [containerHeight, setContainerHeight] = useState<number>(600);
  const isDraggingRef = useRef(false);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setContainerHeight(height);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (containerHeight > 0) {
          // Calculate new ratio based on move distance
          const deltaY = gestureState.dy;
          const deltaRatio = deltaY / containerHeight;
          setSplitRatio((prevRatio) => {
            const nextRatio = prevRatio + deltaRatio;
            return Math.min(Math.max(nextRatio, minRatio), maxRatio);
          });
        }
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
      },
    })
  ).current;

  const topHeight = `${Math.round(splitRatio * 100)}%` as any;
  const bottomHeight = `${Math.round((1 - splitRatio) * 100)}%` as any;

  return (
    <View style={[styles.container, style]} onLayout={onContainerLayout}>
      {/* ── Top Panel ─────────────────────────────────────────────────── */}
      <View style={[styles.topPanel, { height: topHeight }]}>
        {topPanel}
      </View>

      {/* ── Draggable Splitter Handle Bar ─────────────────────────────── */}
      <View
        style={styles.splitterBar}
        {...panResponder.panHandlers}
      >
        <View style={styles.splitterLine} />
        <View style={styles.splitterHandleBadge}>
          <View style={styles.splitterHandleIcon} />
          <Text style={styles.splitterRatioText}>{Math.round(splitRatio * 100)}%</Text>
        </View>
        <View style={styles.splitterLine} />
      </View>

      {/* ── Bottom Panel ──────────────────────────────────────────────── */}
      <View style={[styles.bottomPanel, { height: bottomHeight }]}>
        {bottomPanel}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  presetToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  presetToolbarTitle: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  presetButtonsRow: {
    flexDirection: "row",
    gap: 4,
  },
  presetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: typography.bold,
    color: colors.text.secondary,
  },
  presetBtnActiveText: {
    color: "#000000",
  },
  topPanel: {
    overflow: "hidden",
  },
  splitterBar: {
    height: 24,
    backgroundColor: colors.background.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  splitterLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  splitterHandleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,242,254,0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginHorizontal: 8,
  },
  splitterHandleIcon: {
    width: 12,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  splitterRatioText: {
    fontSize: 10,
    fontWeight: typography.bold,
    color: colors.primary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  bottomPanel: {
    flex: 1,
    overflow: "hidden",
  },
});
