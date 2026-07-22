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

export const OAUTH_PROVIDERS: {
  key: OAuthProviderKey;
  name: string;
  region: "US" | "EU" | "RU" | "ASIA";
  color: string;
  iconText: string;
}[] = [
  // US Providers
  { key: "google", name: "Google", region: "US", color: "#4285F4", iconText: "G" },
  { key: "apple", name: "Apple", region: "US", color: "#FFFFFF", iconText: "" },
  { key: "meta", name: "Meta", region: "US", color: "#1877F2", iconText: "f" },
  // EU Providers
  { key: "netid", name: "NetID", region: "EU", color: "#00A88F", iconText: "ID" },
  // RU Providers
  { key: "vk", name: "VK ID", region: "RU", color: "#0077FF", iconText: "VK" },
  { key: "yandex", name: "Yandex ID", region: "RU", color: "#FC3F1D", iconText: "Y" },
  // Asia Providers
  { key: "wechat", name: "WeChat", region: "ASIA", color: "#07C160", iconText: "微" },
  { key: "line", name: "LINE", region: "ASIA", color: "#00B900", iconText: "L" },
  { key: "kakao", name: "Kakao", region: "ASIA", color: "#FEE500", iconText: "K" },
];

export function OAuthProviderGrid({
  onSelectProvider,
  loading = false,
}: OAuthProviderGridProps) {
  const [activeRegion, setActiveRegion] = useState<"ALL" | "US" | "EU" | "RU" | "ASIA">("ALL");

  const filteredProviders = activeRegion === "ALL"
    ? OAUTH_PROVIDERS
    : OAUTH_PROVIDERS.filter((p) => p.region === activeRegion);

  return (
    <div className="w-full space-y-4">
      {/* Region Filter Tabs */}
      <div className="flex items-center justify-between text-xs text-white/50 bg-white/5 p-1 rounded-xl border border-white/10">
        {(["ALL", "US", "EU", "RU", "ASIA"] as const).map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => setActiveRegion(reg)}
            className={`px-3 py-1 rounded-lg transition-all font-medium ${
              activeRegion === reg
                ? "bg-[#00F2FE] text-black font-semibold shadow-sm shadow-[#00F2FE]/30"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Grid of OAuth Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {filteredProviders.map((provider) => (
          <button
            key={provider.key}
            type="button"
            disabled={loading}
            onClick={() => onSelectProvider(provider.key)}
            className="flex items-center justify-start gap-2.5 p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#00F2FE]/50 transition-all duration-200 group text-left"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform group-hover:scale-105"
              style={{
                backgroundColor: provider.color === "#FFFFFF" ? "rgba(255,255,255,0.15)" : provider.color,
                color: provider.color === "#FEE500" ? "#000000" : "#FFFFFF",
              }}
            >
              {provider.iconText}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-white truncate group-hover:text-[#00F2FE] transition-colors">
                {provider.name}
              </div>
              <div className="text-[10px] text-white/40 font-mono">
                {provider.region}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
