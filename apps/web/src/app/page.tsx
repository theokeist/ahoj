"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Flame, Compass, ArrowRight } from "lucide-react";
import Navigation from "../components/Navigation";
import { MOCK_NEARBY_USERS } from "../lib/mockData";

export default function Home() {
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [privateUnlocked, setPrivateUnlocked] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-[#1A0A2E] text-white overflow-hidden relative pb-16">
      {/* Background neons */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#7B2FE7] rounded-full blur-[150px] opacity-25 pointer-events-none" />

      {/* Global Header */}
      <Navigation />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7B2FE7]/15 border border-[#7B2FE7]/30 text-sm font-semibold text-[#7B2FE7] self-start">
              ✨ Nová éra sociálních sítí
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-[#7B2FE7] bg-clip-text text-transparent">
              Spoj se s lidmi,<br />kteří jsou blízko.
            </h1>
            <p className="text-zinc-300 text-lg leading-relaxed max-w-xl">
              <strong>ahoj</strong> je hyperlokální sociální síť stavící na reálné blízkosti. Zjisti, kdo je v tvém dosahu, prohlížej si mizející příběhy a začni chatovat jen s lidmi v tvém okolí.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] text-sm font-bold text-white shadow-xl hover:shadow-[#7B2FE7]/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
              >
                Vyzkoušet v prohlížeči <ArrowRight size={16} />
              </Link>
              <Link
                href="/brand"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#240D40] border border-[#7B2FE7]/30 hover:bg-[#2A1050]/60 text-sm font-bold text-zinc-100 transition-all"
              >
                Vizuální styl
              </Link>
            </div>
          </div>

          {/* Hero Interactive App Device Mockup */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-[320px] h-[640px] rounded-[48px] border-[8px] border-zinc-800 bg-[#240D40] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-4 overflow-hidden relative flex flex-col">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-full z-20" />

              {/* Simulated App Screen Header */}
              <div className="flex items-center justify-between pt-6 pb-4 border-b border-white/10 px-2">
                <span className="text-lg font-black text-[#7B2FE7]">/A\</span>
                <span className="text-sm font-bold">Lidé v okolí</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Živě
                </span>
              </div>

              {/* Feed Items */}
              <div className="flex-1 flex flex-col overflow-hidden pt-4">
                <div className="px-4">
                  <div className="flex items-center justify-between gap-3">
                    <button className="w-9 h-9 rounded-2xl bg-[#1A0A2E] border border-white/10 text-zinc-200 text-lg font-bold flex items-center justify-center">
                      +
                    </button>
                    <span className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-100">Nearby</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
                      <img
                        src={MOCK_NEARBY_USERS[0]?.avatarUrl}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {isGhostMode && (
                    <div className="mt-3 bg-[#FF6B6B]/15 border border-[#FF6B6B]/30 rounded-3xl p-3 text-[10px] font-semibold text-[#FF6B6B] flex items-center justify-center gap-2">
                      👻 Ghost Mode aktivní — jsi skrytý
                    </div>
                  )}

                  <div className="mt-4 overflow-x-auto pb-3">
                    <div className="flex gap-3">
                      <button className="min-w-[80px] rounded-3xl border border-[#7B2FE7]/30 bg-[#1A0A2E] p-3 text-[10px] text-zinc-300 flex flex-col items-center gap-2">
                        <div className="relative w-14 h-14">
                          <div className="absolute inset-0 rounded-full border border-[#7B2FE7]" />
                          <div className="absolute left-1 top-1 w-12 h-12 rounded-full overflow-hidden bg-zinc-900">
                            <img
                              src={MOCK_NEARBY_USERS[0]?.avatarUrl}
                              alt="Moje Story"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <span className="font-semibold text-white">Moje Story</span>
                      </button>

                      {MOCK_NEARBY_USERS.filter((user) => user.hasActiveStories).map((user) => (
                        <button
                          key={user.id}
                          className="min-w-[80px] rounded-3xl border border-[#7B2FE7]/30 bg-[#1A0A2E] p-3 text-[10px] text-zinc-300 flex flex-col items-center gap-2"
                        >
                          <div className="relative w-14 h-14">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7B2FE7] to-[#FF6B6B]" />
                            <div className="absolute left-1 top-1 w-12 h-12 rounded-full overflow-hidden bg-zinc-900">
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-white truncate">@{user.username}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                  {MOCK_NEARBY_USERS.map((user) => {
                    const isUserPrivate = user.privacyMode === "PRIVATE";
                    const distance = user.distanceMeters < 1000 ? `~${user.distanceMeters} m` : `~${(user.distanceMeters / 1000).toFixed(1)} km`;
                    return (
                      <div key={user.id} className="bg-[#2A1050] border border-[#7B2FE7]/20 rounded-3xl p-3 flex items-center gap-3">
                        <div className="relative">
                          <div className={`absolute inset-0 rounded-full ${user.hasActiveStories ? "bg-gradient-to-tr from-[#7B2FE7] to-[#FF6B6B]" : "border border-[#7B2FE7]/20"}`} />
                          <div className={`relative w-14 h-14 rounded-full overflow-hidden border border-[#2A1050] bg-zinc-900 ${isUserPrivate ? "opacity-70" : ""}`}>
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">@{user.username}</span>
                            {isUserPrivate && <span className="text-[10px] text-zinc-400">🔒</span>}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{user.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-zinc-400">{distance}</span>
                          {user.hasActiveStories && <span className="w-2 h-2 rounded-full bg-[#7B2FE7]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Tab Bar */}
              <div className="h-14 border-t border-white/10 flex items-center justify-around px-2 pt-2 bg-[#240D40]">
                <span className="text-xs text-[#7B2FE7] font-bold flex flex-col items-center">🌍 <span>Okolí</span></span>
                <span className="text-xs text-zinc-400 font-bold flex flex-col items-center">💬 <span>Chat</span></span>
                <button
                  onClick={() => setIsGhostMode(!isGhostMode)}
                  className="text-xs text-zinc-400 font-bold flex flex-col items-center hover:opacity-80 transition-opacity"
                >
                  <span>{isGhostMode ? "👻" : "👤"}</span>
                  <span className={isGhostMode ? "text-[#FF6B6B]" : ""}>Nastavení</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10 grid md:grid-cols-3 gap-8">
        <div className="bg-[#240D40] border border-[#7B2FE7]/20 p-8 rounded-3xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7B2FE7]/10 flex items-center justify-center border border-[#7B2FE7]/20 text-[#7B2FE7]">
            <Compass size={24} />
          </div>
          <h3 className="text-xl font-bold">Proximity Radar</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Objevuj lidi v reálném čase podle své aktuální polohy. Změň dosah vyhledávání od 500 metrů do 5 kilometrů a prozkoumej své okolí.
          </p>
        </div>

        <div className="bg-[#240D40] border border-[#7B2FE7]/20 p-8 rounded-3xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center border border-[#FF6B6B]/20 text-[#FF6B6B]">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold">Ochrana soukromí</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Granulární soukromí. Soukromé účty jsou ve feedu rozmazané a vyžadují schválení žádosti o přístup. Nebo zapni Ghost Mode a staň se zcela neviditelným.
          </p>
        </div>

        <div className="bg-[#240D40] border border-[#7B2FE7]/20 p-8 rounded-3xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
            <Flame size={24} />
          </div>
          <h3 className="text-xl font-bold">Mizející příběhy</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Příběhy mizí po 24 hodinách. Sdílej bez obav z permanentní digitální stopy jen to, co tě baví a co děláš právě v tuto chvíli.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-zinc-500 text-xs py-8 border-t border-white/5 relative z-10">
        ahoj app v0.1.0 • Made with 💜 in Brno
      </footer>
    </div>
  );
}
