// ahoj Design Tokens — Electric Teal & Volcanic Dark Theme

export const colors = {
  // Backgrounds
  background: {
    primary: "#0C0C0C",    // Volcanic dark — main bg
    secondary: "#121212",  // Surface card
    card: "rgba(255, 255, 255, 0.04)",       // Glass card bg
    overlay: "rgba(12, 12, 12, 0.85)",
  },

  // Brand
  primary: "#00F2FE",     // Electric Teal
  primaryDark: "#00DCE6",
  primaryLight: "#70F7FF",

  accent: "#FF6B6B",      // Coral — notifications, CTAs
  accentAlt: "#FFB347",   // Amber — stories ring secondary

  // Story ring gradient
  storyRing: ["#00F2FE", "#FF6B6B"],

  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.4)",
    disabled: "rgba(255, 255, 255, 0.25)",
  },

  // UI
  border: "rgba(0, 242, 254, 0.3)",
  borderLight: "rgba(255, 255, 255, 0.1)",
  glass: "rgba(255, 255, 255, 0.03)",

  // Status
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  online: "#00F2FE",
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
    shadowColor: "#00F2FE",
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
