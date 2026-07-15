import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { colors, typography, spacing, radius } from "../../lib/theme";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(60)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.spring(contentTranslate, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const logoStyle = {
    transform: [{ scale: logoScale }],
    opacity: logoOpacity,
  };

  const contentStyle = {
    transform: [{ translateY: contentTranslate }],
    opacity: contentOpacity,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient circles */}
      <View style={[styles.gradientCircle, styles.circle1]} />
      <View style={[styles.gradientCircle, styles.circle2]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={styles.logoText}>/A\</Text>
        <Text style={styles.logoTagline}>ahoj</Text>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.headline}>Meet people{"\n"}near you.</Text>
        <Text style={styles.subheadline}>
          Discover interesting people around you through stories and a short
          message. No algorithm — just proximity.
        </Text>

        {/* CTAs */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/auth/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/auth/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing, you agree to our Terms & Privacy Policy.{"\n"}Must be
          16+ to use ahoj.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    overflow: "hidden",
  },
  gradientCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.15,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: colors.primary,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: colors.accent,
    bottom: 0,
    left: -80,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  logoText: {
    fontSize: 56,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: -2,
  },
  logoTagline: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text.primary,
    letterSpacing: 8,
    marginTop: -8,
  },
  content: {
    width: "100%",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  headline: {
    fontSize: typography.xxl,
    fontWeight: typography.black,
    color: colors.text.primary,
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  subheadline: {
    fontSize: typography.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: "center",
    ...{
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: typography.md,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
  legal: {
    textAlign: "center",
    fontSize: typography.xs,
    color: colors.text.tertiary,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
