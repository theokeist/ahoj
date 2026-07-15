"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#1A0A2E]/80 backdrop-blur-md border-b border-[#7B2FE7]/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <span className="text-3xl font-black text-[#7B2FE7] tracking-tighter group-hover:text-[#FF6B6B] transition-colors">
            /A\
          </span>
          <span className="text-xl font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">
            ahoj
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition-colors ${
              pathname === "/" ? "text-[#FF6B6B]" : "text-zinc-300 hover:text-white"
            }`}
          >
            Úvod
          </Link>
          <Link
            href="/simulator"
            className={`text-sm font-semibold transition-colors ${
              pathname === "/simulator" ? "text-[#FF6B6B]" : "text-zinc-300 hover:text-white"
            }`}
          >
            Simulátor
          </Link>
          <Link
            href="/brand"
            className={`text-sm font-semibold transition-colors ${
              pathname === "/brand" ? "text-[#FF6B6B]" : "text-zinc-300 hover:text-white"
            }`}
          >
            Značka
          </Link>
        </nav>

        {/* Action button */}
        <div className="flex items-center gap-4">
          <Link
            href="/simulator"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] text-xs font-bold text-white shadow-lg hover:shadow-[#7B2FE7]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles size={14} /> Spustit Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
