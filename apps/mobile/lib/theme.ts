// ahoj Design Tokens

export const colors = {
  // Backgrounds
  background: {
    primary: "#1A0A2E",    // Deep violet — main bg
    secondary: "#240D40",  // Slightly lighter
    card: "#2A1050",       // Card bg
    overlay: "rgba(26, 10, 46, 0.85)",
  },

  // Brand
  primary: "#7B2FE7",     // Electric purple
  primaryDark: "#5A1FB8",
  primaryLight: "#9B5AF0",

  accent: "#FF6B6B",      // Coral — notifications, CTAs
  accentAlt: "#FFB347",   // Amber — stories ring secondary

  // Story ring gradient
  storyRing: ["#7B2FE7", "#FF6B6B"],

  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.4)",
    disabled: "rgba(255, 255, 255, 0.25)",
  },

  // UI
  border: "rgba(123, 47, 231, 0.3)",
  borderLight: "rgba(255, 255, 255, 0.1)",
  glass: "rgba(123, 47, 231, 0.1)",

  // Status
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  online: "#4ADE80",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,

  // Font weights (React Native uses strings)
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  black: "900" as const,
} as const;

export const shadows = {
  glow: {
    shadowColor: "#7B2FE7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;
