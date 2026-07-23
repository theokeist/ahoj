"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Heart, Zap, Shield, Users } from "lucide-react";
import Navigation from "../../components/Navigation";
import { getTranslations, type SupportedLanguage } from "../../locales";

export default function AboutPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [lang, setLang] = useState<SupportedLanguage>("cs");

  useEffect(() => {
    const saved = localStorage.getItem("ahoj-lang") as SupportedLanguage;
    if (saved) setLang(saved);

    const handleLangChange = (e: any) => {
      if (e.detail) setLang(e.detail);
    };
    window.addEventListener("ahoj-lang-change", handleLangChange);
    return () => window.removeEventListener("ahoj-lang-change", handleLangChange);
  }, []);

  const t = getTranslations(lang).about;
  const common = getTranslations(lang).common;

  const peopleList = [
    { id: 1, name: "Karolína V.", age: 24, city: "Brno", photo: "https://randomuser.me/api/portraits/women/44.jpg", distance: "320m", story: t.stories.karolina },
    { id: 2, name: "Tomáš P.", age: 28, city: "Praha", photo: "https://randomuser.me/api/portraits/men/32.jpg", distance: "1.2km", story: t.stories.tomas },
    { id: 3, name: "Tereza K.", age: 22, city: "Ostrava", photo: "https://randomuser.me/api/portraits/women/68.jpg", distance: "750m", story: t.stories.tereza },
    { id: 4, name: "Lukáš M.", age: 31, city: "Plzeň", photo: "https://randomuser.me/api/portraits/men/75.jpg", distance: "500m", story: t.stories.lukas },
    { id: 5, name: "Anežka S.", age: 19, city: "Brno", photo: "https://randomuser.me/api/portraits/women/12.jpg", distance: "90m", story: t.stories.anezka },
    { id: 6, name: "Marek D.", age: 26, city: "Liberec", photo: "https://randomuser.me/api/portraits/men/54.jpg", distance: "2.1km", story: t.stories.marek },
    { id: 7, name: "Barbora N.", age: 33, city: "Olomouc", photo: "https://randomuser.me/api/portraits/women/89.jpg", distance: "410m", story: t.stories.barbora },
    { id: 8, name: "Ondřej F.", age: 25, city: "Praha", photo: "https://randomuser.me/api/portraits/men/22.jpg", distance: "880m", story: t.stories.ondrej },
  ];

  const statsList = [
    { value: "48k+", label: t.stats.users, icon: <Users size={20} /> },
    { value: "320ms", label: t.stats.radar, icon: <Zap size={20} /> },
    { value: "94%", label: t.stats.metIrl, icon: <Heart size={20} /> },
    { value: "12k+", label: t.stats.sparks, icon: <MapPin size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-[#00F2FE]/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-[#C56BFF]/10 rounded-full blur-[180px] pointer-events-none" />

      <Navigation />

      <main className="flex-1 pt-28 pb-24 relative z-10">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 text-center mb-20 space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/25 text-xs font-bold text-[#00F2FE]">
            <Sparkles size={12} /> {t.badge}
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
            {t.title1}<br />
            <span className="bg-gradient-to-r from-[#00F2FE] to-[#C56BFF] bg-clip-text text-transparent">
              {t.title2}
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/register" className="px-7 py-3.5 rounded-2xl bg-[#00F2FE] text-black font-bold text-sm shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:scale-[1.02] transition-all flex items-center gap-2">
              {t.joinButton} <ArrowRight size={15} />
            </Link>
            <Link href="/login" className="px-7 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-white/70 hover:text-white text-sm font-semibold transition-all hover:border-white/20">
              {t.signInButton}
            </Link>
          </div>
        </div>

        {/* ── Masonry Grid ──────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            style={{
              columnCount: 3,
              columnGap: "16px",
            }}
            className="masonry-grid"
          >

            {/* ── People cards ──────────────────────────────── */}
            {peopleList.map((p) => (
              <div
                key={p.id}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  breakInside: "avoid",
                  marginBottom: 16,
                  borderRadius: 20,
                  border: hovered === p.id ? "1px solid rgba(0,242,254,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  background: hovered === p.id
                    ? "rgba(0,242,254,0.04)"
                    : "rgba(255,255,255,0.03)",
                  padding: "18px",
                  transition: "all 0.2s ease",
                  transform: hovered === p.id ? "translateY(-2px)" : "none",
                  boxShadow: hovered === p.id ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
                  cursor: "default",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={p.photo}
                      alt={p.name}
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,242,254,0.4)" }}
                    />
                    <div style={{
                      position: "absolute", bottom: -2, right: -2,
                      width: 12, height: 12, borderRadius: "50%",
                      backgroundColor: "#4CAF50",
                      border: "2px solid #0C0C0C",
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={9} style={{ color: "#00F2FE" }} />
                      {p.city} · {p.distance}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#00F2FE", backgroundColor: "rgba(0,242,254,0.10)", padding: "2px 8px", borderRadius: 20 }}>
                    LIVE
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                  &ldquo;{p.story}&rdquo;
                </p>
              </div>
            ))}

            {/* ── Stats card ────────────────────────────────── */}
            <div style={{
              breakInside: "avoid",
              marginBottom: 16,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, rgba(0,242,254,0.06) 0%, rgba(197,107,255,0.06) 100%)",
              padding: "24px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                {t.statsTitle}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {statsList.map((s) => (
                  <div key={s.label}>
                    <div style={{ color: "#00F2FE", marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Big quote card ────────────────────────────── */}
            <div style={{
              breakInside: "avoid",
              marginBottom: 16,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(0,242,254,0.10), rgba(0,180,200,0.05))",
              border: "1px solid rgba(0,242,254,0.20)",
              padding: "28px",
            }}>
              <div style={{ fontSize: 48, color: "#00F2FE", lineHeight: 1, marginBottom: 12, opacity: 0.4 }}>&ldquo;</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.6, margin: "0 0 16px" }}>
                {t.founderQuote}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="https://randomuser.me/api/portraits/men/41.jpg"
                  alt="Founder"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(0,242,254,0.5)" }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{t.founderTitle}</div>
                </div>
              </div>
            </div>

            {/* ── Privacy card ──────────────────────────────── */}
            <div style={{
              breakInside: "avoid",
              marginBottom: 16,
              borderRadius: 20,
              background: "rgba(255,107,107,0.05)",
              border: "1px solid rgba(255,107,107,0.15)",
              padding: "22px",
            }}>
              <Shield size={24} style={{ color: "#FF6B6B", marginBottom: 12 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{t.privacyTitle}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {t.privacyChecklist.map((item) => (
                  <li key={item} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#FF6B6B", marginTop: 2, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── CTA card ──────────────────────────────────── */}
            <div style={{
              breakInside: "avoid",
              marginBottom: 16,
              borderRadius: 20,
              background: "linear-gradient(135deg, #00F2FE, #00B8C2)",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#000", lineHeight: 1.2 }}>
                {t.ctaTitle}
              </div>
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.65)", lineHeight: 1.5, margin: 0 }}>
                {t.ctaDesc}
              </p>
              <Link
                href="/register"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  backgroundColor: "#000",
                  color: "#00F2FE",
                  padding: "10px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  alignSelf: "flex-start",
                }}
              >
                {t.ctaButton} <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/30">
        ahoj app v0.1.0 • {common.footer.madeWith} •{" "}
        <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
        {" · "}
        <Link href="/register" className="hover:text-white/60 transition-colors">Register</Link>
      </footer>
    </div>
  );
}
