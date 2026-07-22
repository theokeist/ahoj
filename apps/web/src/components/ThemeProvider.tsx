"use client";

import React from "react";
import { ConfigProvider, theme } from "antd";

/**
 * ThemeProvider — Ant Design token overrides strictly aligned to mobile theme.ts
 *
 * Mobile reference: apps/mobile/lib/theme.ts
 *   colorPrimary    → colors.primary       (#00F2FE)
 *   colorBgBase     → background.primary   (#0C0C0C)
 *   colorBgContainer→ background.secondary (#121212)
 *   colorBgElevated → slightly lighter     (#181818)
 *   colorBorder     → borderLight          rgba(255,255,255,0.1)
 *   colorText       → text.primary         (#FFFFFF)
 *   colorTextSecondary→ text.secondary     rgba(255,255,255,0.7)
 *   borderRadius    → radius.md            12
 *   fontFamily      → typography.fontFamily (Outfit, Inter, system-ui)
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          // Brand
          colorPrimary:        "#00F2FE",   // colors.primary
          colorPrimaryHover:   "#00DCE6",   // colors.primaryDark
          colorPrimaryActive:  "#00B8C2",

          // Backgrounds
          colorBgBase:         "#0C0C0C",   // background.primary
          colorBgContainer:    "#121212",   // background.secondary
          colorBgElevated:     "#181818",
          colorFillSecondary:  "rgba(255,255,255,0.04)", // background.card

          // Borders
          colorBorder:         "rgba(255,255,255,0.10)", // borderLight
          colorBorderSecondary:"rgba(255,255,255,0.05)",

          // Text
          colorText:           "#FFFFFF",               // text.primary
          colorTextSecondary:  "rgba(255,255,255,0.70)", // text.secondary
          colorTextPlaceholder:"rgba(255,255,255,0.25)", // text.disabled

          // Feedback
          colorSuccess:        "#4CAF50",   // colors.success
          colorWarning:        "#FF9800",   // colors.warning
          colorError:          "#F44336",   // colors.error

          // Radius (radius.md = 12)
          borderRadius:        12,
          borderRadiusLG:      16,
          borderRadiusSM:      8,

          // Typography
          fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
          fontSize:   15,  // typography.base

          // Controls
          controlHeight:       44,
          controlHeightSM:     36,
        },
        components: {
          Input: {
            colorBgContainer:  "rgba(255,255,255,0.03)",  // glass
            activeBorderColor: "#00F2FE",                 // colors.primary
            hoverBorderColor:  "rgba(0,242,254,0.50)",
            colorBorder:       "rgba(255,255,255,0.10)",
            activeShadow:      "0 0 12px rgba(0,242,254,0.30)",
          },
          Button: {
            colorPrimary:      "#00F2FE",
            colorPrimaryHover: "#00DCE6",
            colorPrimaryActive:"#00B8C2",
            primaryShadow:     "0 0 20px rgba(0,242,254,0.35)",
            borderRadius:      12,
            fontWeight:        600,
          },
          Card: {
            colorBgContainer:   "#121212",
            colorBorderSecondary:"rgba(255,255,255,0.08)",
            borderRadius:       16,
          },
          Select: {
            colorBgContainer:  "rgba(255,255,255,0.03)",
            colorBorder:       "rgba(255,255,255,0.10)",
          },
          DatePicker: {
            colorBgContainer:  "rgba(255,255,255,0.03)",
            colorBorder:       "rgba(255,255,255,0.10)",
          },
          Divider: {
            colorSplit:        "rgba(255,255,255,0.10)",
            colorText:         "rgba(255,255,255,0.40)",
          },
          Message: {
            colorBgElevated:   "#181818",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
