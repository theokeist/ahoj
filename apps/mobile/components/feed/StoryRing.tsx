import { useEffect, useRef } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { colors } from "../../lib/theme";

export function StoryRing({ hasStories, size = 52 }: { hasStories: boolean; size?: number }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasStories) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 360,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.setValue(0);
    }
  }, [hasStories]);

  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const animStyle = {
    transform: [{ rotate: spin }],
  };

  if (!hasStories) {
    return (
      <View
        style={[
          styles.avatarRing,
          { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
          { borderColor: colors.borderLight },
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        animStyle,
        styles.avatarRingActive,
        { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  avatarRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  avatarRingActive: {
    position: "absolute",
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
});
