"use client";

import React from "react";
import Link from "next/link";
import { Compass, Shield, Flame, Sparkles, ArrowRight } from "lucide-react";
import Navigation from "../components/Navigation";
import { MOCK_NEARBY_USERS } from "../lib/mockData";

export default function WelcomingLandingPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00F2FE]/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#FF6B6B]/10 rounded-full blur-[180px] pointer-events-none" />

      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-20 relative z-10 space-y-24">

        {/* Hero */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-xs font-bold text-[#00F2FE]">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Proximity Social Network
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-[#00F2FE] bg-clip-text text-transparent">
              Spoj se s lidmi,<br />kteří jsou blízko.
            </h1>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl">
              <strong>ahoj</strong> je hyperlokální sociální síť stavící na reálné blízkosti. Zjisti, kdo je v tvém dosahu, prohlížej si mizející příběhy a začni chatovat jen s lidmi v tvém okolí.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 rounded-2xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 hover:border-[#00F2FE]/40 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/about"
                className="px-6 py-4 rounded-2xl text-white/60 hover:text-white text-sm font-semibold transition-colors"
              >
                About & Tech
              </Link>
            </div>
          </div>

          {/* Right: Radar Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[320px] h-[620px] rounded-[44px] border-[8px] border-white/10 bg-[#121212] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-4 overflow-hidden relative flex flex-col">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-white/10 rounded-full z-20" />

              {/* Simulated App Header */}
              <div className="flex items-center justify-between pt-5 pb-3 border-b border-white/10 px-2">
                <span className="text-lg font-black text-[#00F2FE]">/A\</span>
                <span className="text-xs font-bold text-white">Live Radar</span>
                <span className="text-[10px] text-[#00F2FE] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" /> Active
                </span>
              </div>

              {/* Feed Items */}
              <div className="flex-1 overflow-y-auto pt-3 space-y-3 px-1">
                {MOCK_NEARBY_USERS.map((user) => (
                  <div key={user.id} className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00F2FE]/40 shrink-0">
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">@{user.username}</div>
                      <div className="text-[10px] text-white/50 truncate">{user.message}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#00F2FE]">~{user.distanceMeters}m</span>
                  </div>
                ))}
              </div>

              {/* Bottom Nav */}
              <div className="h-12 border-t border-white/10 flex items-center justify-around text-xs text-white/40 pt-1">
                <span className="text-[#00F2FE] font-bold">🌍 Radar</span>
                <span>⚡ Sparks</span>
                <span>💬 Chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/10 hover:border-[#00F2FE]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Proximity Radar</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Objevuj lidi v reálném čase podle své aktuální polohy. Změň dosah vyhledávání od 500 metrů do 5 kilometrů a prozkoumej své okolí.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/10 hover:border-[#FF6B6B]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-center justify-center text-[#FF6B6B]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Ochrana soukromí</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Granulární soukromí. Soukromé účty jsou ve feedu rozmazané a vyžadují schválení žádosti o přístup. Nebo zapni Ghost Mode a staň se neviditelným.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/10 hover:border-amber-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Mizející příběhy</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Příběhy mizí po 24 hodinách. Sdílej bez obav z permanentní digitální stopy jen to, co tě baví a co děláš právě v tuto chvíli.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        ahoj app v0.1.0 • Made with 💜 in Brno
      </footer>
    </div>
  );
}
