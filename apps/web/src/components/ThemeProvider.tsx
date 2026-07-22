"use client";

import React from "react";
import { ConfigProvider, theme } from "antd";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#00F2FE",
          colorBgBase: "#0C0C0C",
          colorBgContainer: "#121212",
          colorBgElevated: "#181818",
          colorBorder: "rgba(255, 255, 255, 0.1)",
          colorBorderSecondary: "rgba(255, 255, 255, 0.05)",
          colorText: "#FFFFFF",
          colorTextSecondary: "rgba(255, 255, 255, 0.65)",
          colorTextPlaceholder: "rgba(255, 255, 255, 0.35)",
          borderRadius: 12,
          fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
          controlHeight: 44,
        },
        components: {
          Input: {
            colorBgContainer: "rgba(255, 255, 255, 0.03)",
            activeBorderColor: "#00F2FE",
            hoverBorderColor: "rgba(0, 242, 254, 0.5)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
          },
          Button: {
            colorPrimaryHover: "#00DCE6",
            colorPrimaryActive: "#00B8C2",
            borderRadius: 12,
            fontWeight: 600,
          },
          Card: {
            colorBgContainer: "rgba(18, 18, 18, 0.75)",
            colorBorderSecondary: "rgba(255, 255, 255, 0.08)",
          },
          Select: {
            colorBgContainer: "rgba(255, 255, 255, 0.03)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
