"use client";

import React, { useState } from "react";

export type OAuthProviderKey =
  | "google"
  | "apple"
  | "meta"
  | "netid"
  | "vk"
  | "yandex"
  | "wechat"
  | "line"
  | "kakao";

interface OAuthProviderGridProps {
  onSelectProvider: (provider: OAuthProviderKey) => void;
  loading?: boolean;
}

const OAUTH_PROVIDERS: {
  key: OAuthProviderKey;
  name: string;
  region: "US" | "EU" | "RU" | "ASIA";
  bg: string;
  fg: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "google",
    name: "Google",
    region: "US",
    bg: "#fff",
    fg: "#1a1a1a",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    key: "apple",
    name: "Apple",
    region: "US",
    bg: "#000",
    fg: "#fff",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    key: "meta",
    name: "Meta",
    region: "US",
    bg: "#1877F2",
    fg: "#fff",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key: "netid",
    name: "NetID",
    region: "EU",
    bg: "#00A88F",
    fg: "#fff",
    icon: <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>ID</span>,
  },
  {
    key: "vk",
    name: "VK ID",
    region: "RU",
    bg: "#0077FF",
    fg: "#fff",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C5.16 11.16 4.56 9.064 4.56 8.576c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.779.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.82c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .373.17.508.271.508.22 0 .407-.135.813-.542 1.253-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z"/>
      </svg>
    ),
  },
  {
    key: "yandex",
    name: "Yandex",
    region: "RU",
    bg: "#FC3F1D",
    fg: "#fff",
    icon: <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>Y</span>,
  },
  {
    key: "wechat",
    name: "WeChat",
    region: "ASIA",
    bg: "#07C160",
    fg: "#fff",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.601-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.064-6.122h.002zm-3.89 3.189c.538 0 .976.435.976.973a.976.976 0 0 1-1.952 0c0-.538.438-.973.976-.973zm4.908 0c.538 0 .976.435.976.973a.976.976 0 0 1-1.952 0c0-.538.438-.973.976-.973z"/>
      </svg>
    ),
  },
  {
    key: "line",
    name: "LINE",
    region: "ASIA",
    bg: "#00B900",
    fg: "#fff",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
    ),
  },
  {
    key: "kakao",
    name: "Kakao",
    region: "ASIA",
    bg: "#FEE500",
    fg: "#3c1e1e",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="#3c1e1e" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.56 5.1 3.96 6.6l-.96 3.6 4.2-2.76c.9.18 1.8.24 2.76.24 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
      </svg>
    ),
  },
];

const REGIONS = ["ALL", "US", "EU", "RU", "ASIA"] as const;

export function OAuthProviderGrid({
  onSelectProvider,
  loading = false,
}: OAuthProviderGridProps) {
  const [activeRegion, setActiveRegion] = useState<"ALL" | "US" | "EU" | "RU" | "ASIA">("ALL");
  const [hoveredKey, setHoveredKey] = useState<OAuthProviderKey | null>(null);

  const filteredProviders =
    activeRegion === "ALL"
      ? OAUTH_PROVIDERS
      : OAUTH_PROVIDERS.filter((p) => p.region === activeRegion);

  return (
    <div className="w-full space-y-3">

      {/* Region Filter */}
      <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
        {REGIONS.map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => setActiveRegion(reg)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            style={{
              background: activeRegion === reg ? "var(--color-primary)" : "transparent",
              color: activeRegion === reg ? "#000" : "rgba(255,255,255,0.45)",
              boxShadow: activeRegion === reg ? "0 0 10px rgba(0,242,254,0.25)" : "none",
            }}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Provider Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {filteredProviders.map((provider) => {
          const isHovered = hoveredKey === provider.key;
          return (
            <button
              key={provider.key}
              type="button"
              disabled={loading}
              onClick={() => onSelectProvider(provider.key)}
              onMouseEnter={() => setHoveredKey(provider.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className="relative flex flex-col items-center gap-2 pt-3 pb-2.5 px-2 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden group"
              style={{
                backgroundColor: isHovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                borderColor: isHovered ? "rgba(0,242,254,0.4)" : "rgba(255,255,255,0.08)",
                transform: isHovered ? "translateY(-1px)" : "none",
                boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,242,254,0.06) 0%, transparent 70%)" }}
              />

              {/* Provider Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: provider.bg }}
              >
                {provider.icon}
              </div>

              {/* Provider name */}
              <span className="text-[10px] font-semibold text-white/70 group-hover:text-white transition-colors truncate w-full text-center">
                {provider.name}
              </span>

              {/* Region chip */}
              <span
                className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {provider.region}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-white/25 pt-1">
        🔒 OAuth credentials are never stored — provider token only
      </p>
    </div>
  );
}
