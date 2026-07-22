"use client";

import React from "react";
import Link from "next/link";
import { Compass, Shield, Flame, Sparkles, Globe, Lock, ArrowRight, Server, Smartphone, Zap } from "lucide-react";
import Navigation from "../../components/Navigation";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00F2FE]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#7B2FE7]/15 rounded-full blur-[160px] pointer-events-none" />

      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-24 relative z-10 space-y-20">
        
        {/* Presentation Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-xs font-bold text-[#00F2FE]">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Proximity Network
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            About <span className="text-[#00F2FE]">ahoj</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            <strong>ahoj</strong> is a hyper-local social network built on physical proximity. Connect with people right around you, join spontaneous 2-hour meetups, and share expiring stories without permanent digital footprints.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="px-6 py-3.5 rounded-2xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
            >
              Launch Web App <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/10 hover:border-[#00F2FE]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">PostGIS Proximity Radar</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Calculates real-time distance using PostGIS geography queries (<span className="font-mono text-[#00F2FE]">ST_DWithin</span>). Never exposes exact GPS coordinates to protect user safety.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/10 hover:border-[#00F2FE]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-center justify-center text-[#FF6B6B]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Ghost Mode & Safe Zones</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Granular privacy controls. Switch to Ghost Mode to fuzz your location coordinate telemetry or hide completely from nearby feed scans.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/10 hover:border-[#00F2FE]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">24h Expiring Stories</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Ephemeral media sharing. Upload photo/video stories pinned to your current location that automatically expire after 24 hours.
            </p>
          </div>
        </div>

        {/* Tech Stack Specs */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-8 border border-white/10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Architecture & Technology Stack</h2>
            <p className="text-xs text-white/60">Built as a modern high-performance pnpm monorepo</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Web Frontend
              </div>
              <p className="text-xs text-white/80">Next.js 16 (Turbopack), Tailwind CSS v4, Ant Design v5 glassmorphic theme.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Mobile App
              </div>
              <p className="text-xs text-white/80">Expo React Native, Expo Router, React Query, Zustand state manager.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4" /> Backend Server
              </div>
              <p className="text-xs text-white/80">Fastify Node server, Socket.io real-time WebSocket server, Drizzle ORM.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Database & Cache
              </div>
              <p className="text-xs text-white/80">PostgreSQL 16 with PostGIS extension, Redis 7 spatial index & pub/sub.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        ahoj app v0.1.0 • Made with 💜 in Brno
      </footer>
    </div>
  );
}
