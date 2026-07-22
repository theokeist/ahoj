"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ChevronDown, User, UserPlus } from "lucide-react";

const LANGUAGES = [
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

        {/* Nav Links */}
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
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">

          {/* Language Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-[#00F2FE]/40 text-xs font-semibold text-white/70 hover:text-white transition-all bg-white/[0.03] cursor-pointer"
            >
              <Globe size={13} className="text-[#00F2FE]" />
              <span className="hidden sm:inline">{selectedLang.flag} {selectedLang.code.toUpperCase()}</span>
              <span className="sm:hidden">{selectedLang.flag}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                      selectedLang.code === lang.code
                        ? "bg-[#00F2FE]/10 text-[#00F2FE]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    {lang.label}
                    {selectedLang.code === lang.code && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Buttons */}
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
