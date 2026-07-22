"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, UserPlus, Compass, Info } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0C0C0C]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <span className="text-3xl font-black text-[#00F2FE] tracking-tighter group-hover:scale-105 transition-transform">
            /A\
          </span>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#00F2FE] transition-colors">
            ahoj
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition-colors ${
              pathname === "/" ? "text-[#00F2FE]" : "text-white/70 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-semibold transition-colors ${
              pathname === "/about" ? "text-[#00F2FE]" : "text-white/70 hover:text-white"
            }`}
          >
            About
          </Link>
          <Link
            href="/app"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname === "/app" ? "text-[#00F2FE]" : "text-white/70 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-[#00F2FE]" /> Web App
          </Link>
        </nav>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 hover:border-[#00F2FE]/50 text-xs font-semibold text-white/80 hover:text-white transition-all bg-white/[0.03]"
          >
            <User size={14} /> Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00DCE6] text-xs font-bold text-black shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all"
          >
            <UserPlus size={14} /> Register
          </Link>
        </div>
      </div>
    </header>
  );
}
