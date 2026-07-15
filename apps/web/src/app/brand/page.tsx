"use client";

import React from "react";
import Navigation from "../../components/Navigation";
import { Sparkles, Smartphone, Download } from "lucide-react";

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-[#1A0A2E] text-white relative pb-16">
      {/* Background neons */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#7B2FE7] rounded-full blur-[150px] opacity-15 pointer-events-none" />

      {/* Global Navigation */}
      <Navigation />

      {/* Brand & Showcase Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B6B]/15 border border-[#FF6B6B]/30 text-sm font-semibold text-[#FF6B6B] self-start">
              🚀 Vizuální identita ahoj
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-[#7B2FE7] bg-clip-text text-transparent">
              Vizuální styl sítě ahoj
            </h1>
            <p className="text-zinc-300 leading-relaxed text-base">
              Minimalistické pojetí vizuálního stylu kombinuje neonové barvy s moderními 3D prvky a skleněným efektem (glassmorphism). Naše nové logo představuje stylizované písmeno <strong>A</strong> jako <strong>/A\</strong>, což symbolizuje směrovou anténu, vysílací signál a lokální blízkost.
            </p>

            {/* Asset Details */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-4 bg-[#240D40] p-4 rounded-2xl border border-[#7B2FE7]/20">
                <img src="/app-icon.png" alt="ahoj App Icon" className="w-16 h-16 rounded-2xl border border-[#7B2FE7]/40 shadow-lg" />
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-100">Ikona aplikace ahoj</h4>
                  <p className="text-xs text-zinc-400">Ikona na domovské obrazovce s hloubkovým 3D efektem a neonovou aurou.</p>
                </div>
                <a href="/app-icon.png" download="ahoj-icon.png" className="w-10 h-10 rounded-full bg-[#7B2FE7]/20 border border-[#7B2FE7] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all">
                  <Download size={14} />
                </a>
              </div>

              <div className="flex items-center gap-4 bg-[#240D40] p-4 rounded-2xl border border-[#7B2FE7]/20">
                <div className="w-16 h-16 rounded-2xl bg-[#7B2FE7]/15 flex items-center justify-center border border-[#7B2FE7]/30 text-[#7B2FE7]">
                  <Smartphone size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-100">Splash Screen (Úvodní obrazovka)</h4>
                  <p className="text-xs text-zinc-400">Úvodní obrazovka aplikace bez logotextu, zaměřená čistě na 3D zobrazení loga.</p>
                </div>
                <a href="/app-splash.png" download="ahoj-splash.png" className="w-10 h-10 rounded-full bg-[#7B2FE7]/20 border border-[#7B2FE7] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all">
                  <Download size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Visual Presentation Column */}
          <div className="flex flex-col items-center gap-6 md:justify-end">
            <h3 className="text-sm font-semibold text-zinc-400 self-center md:self-start">Ukázka úvodní obrazovky (Splash Screen)</h3>
            
            {/* Mockup phone displaying splash screen */}
            <div className="w-[280px] h-[560px] rounded-[40px] border-[8px] border-zinc-800 bg-[#1A0A2E] shadow-2xl p-2 overflow-hidden relative">
              <img src="/app-splash.png" alt="ahoj Splash Screen" className="w-full h-full object-cover rounded-[30px]" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-full z-20" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
