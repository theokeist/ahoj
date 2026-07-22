"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Heart, Zap, Shield, Users } from "lucide-react";
import Navigation from "../../components/Navigation";

/* ── People data with free randomuser photos ──────────────────── */
const PEOPLE = [
  { id: 1, name: "Karolína V.", age: 24, city: "Brno", photo: "https://randomuser.me/api/portraits/women/44.jpg", distance: "320m", story: "Potkala jsem tu svou nejlepší kamarádku. Bydlíme 300 metrů od sebe a ani jsme o sobě nevěděly." },
  { id: 2, name: "Tomáš P.", age: 28, city: "Praha", photo: "https://randomuser.me/api/portraits/men/32.jpg", distance: "1.2km", story: "Organizuju spontánní basketbalové zápasy přes Sparks. Vždy se najde 10 lidí během hodiny." },
  { id: 3, name: "Tereza K.", age: 22, city: "Ostrava", photo: "https://randomuser.me/api/portraits/women/68.jpg", distance: "750m", story: "Ghost Mode je záchrana. Zapnu ho kdykoliv potřebuju klid, ale přesto vidím příběhy kolem sebe." },
  { id: 4, name: "Lukáš M.", age: 31, city: "Plzeň", photo: "https://randomuser.me/api/portraits/men/75.jpg", distance: "500m", story: "Přes ahoj jsem našel partu na horolezení. Chodíme spolu každý víkend." },
  { id: 5, name: "Anežka S.", age: 19, city: "Brno", photo: "https://randomuser.me/api/portraits/women/12.jpg", distance: "90m", story: "Bydlíme ve stejném domě! Sdílíme příběhy o kavárničkách a lokalitách, které milujeme." },
  { id: 6, name: "Marek D.", age: 26, city: "Liberec", photo: "https://randomuser.me/api/portraits/men/54.jpg", distance: "2.1km", story: "Jako fotograf zbožňuju, jak ahoj propojuje lidi se sdílenou vášní bez nutnosti sledovat velká media." },
  { id: 7, name: "Barbora N.", age: 33, city: "Olomouc", photo: "https://randomuser.me/api/portraits/women/89.jpg", distance: "410m", story: "Naše zahradní komunita vznikla přes ahoj. Sdílíme zeleninu a tipy na pěstování." },
  { id: 8, name: "Ondřej F.", age: 25, city: "Praha", photo: "https://randomuser.me/api/portraits/men/22.jpg", distance: "880m", story: "Každý pátek organizuju impromptu jam sessions. ahoj je nejlepší způsob jak najít muzikanty nablízku." },
];

/* ── Masonry stats ────────────────────────────────────────────── */
const STATS = [
  { value: "48k+", label: "Aktivní uživatelé", icon: <Users size={20} /> },
  { value: "320ms", label: "Průměrná odezva radaru", icon: <Zap size={20} /> },
  { value: "94%", label: "Uživatelů se potkalo naživo", icon: <Heart size={20} /> },
  { value: "12k+", label: "Sparks meetupů měsíčně", icon: <MapPin size={20} /> },
];

/* ── Feature cards (vary height) ─────────────────────────────── */
const FEATURES = [
  {
    icon: <MapPin size={22} />,
    color: "#00F2FE",
    title: "Hyper-local radar",
    body: "Nastav svůj dosah od 100 metrů do 5 kilometrů. Vidíš jen lidi, kteří jsou skutečně poblíž.",
    size: "tall",
  },
  {
    icon: <Zap size={22} />,
    color: "#FFB347",
    title: "Sparks meetupy",
    body: "Vytvoř spontánní setkání — sport, káva, jam session. Vyprší po 2 hodinách.",
    size: "short",
  },
  {
    icon: <Shield size={22} />,
    color: "#FF6B6B",
    title: "Ghost Mode",
    body: "Staň se neviditelným. Vidíš okolí, okolí nevidí tebe.",
    size: "short",
  },
  {
    icon: <Heart size={22} />,
    color: "#C56BFF",
    title: "Příběhy na 24h",
    body: "Sdílej momenty bez permanentní digitální stopy. Příběhy mizí automaticky.",
    size: "tall",
  },
];

export default function AboutPage() {
  const [hovered, setHovered] = useState<number | null>(null);

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
            <Sparkles size={12} /> Lidé blízko tebe
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
            Reálné spojení.<br />
            <span className="bg-gradient-to-r from-[#00F2FE] to-[#C56BFF] bg-clip-text text-transparent">
              Reálná blízkost.
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            ahoj není o sledování celebrit. Je o lidech kolem tebe — sousedech, spolucestujících, nových přátelích na dosah ruky.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/register" className="px-7 py-3.5 rounded-2xl bg-[#00F2FE] text-black font-bold text-sm shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:scale-[1.02] transition-all flex items-center gap-2">
              Připojit se <ArrowRight size={15} />
            </Link>
            <Link href="/login" className="px-7 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-white/70 hover:text-white text-sm font-semibold transition-all hover:border-white/20">
              Přihlásit se
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
            {PEOPLE.map((p) => (
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
                ahoj v číslech
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div style={{ color: "#00F2FE", marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Feature cards ─────────────────────────────── */}
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  breakInside: "avoid",
                  marginBottom: 16,
                  borderRadius: 20,
                  border: `1px solid rgba(255,255,255,0.08)`,
                  background: "rgba(255,255,255,0.025)",
                  padding: f.size === "tall" ? "28px 22px" : "20px 22px",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${f.color}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  backgroundColor: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: f.color,
                  marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{f.body}</p>
              </div>
            ))}

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
                Sociální sítě nás naučily sledovat cizince tisíce kilometrů daleko. ahoj tě učí vidět lidi vedle tebe.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="https://randomuser.me/api/portraits/men/41.jpg"
                  alt="Founder"
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(0,242,254,0.5)" }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Martin, zakladatel</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Brno, Česká republika</div>
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
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Tvoje soukromí, tvoje pravidla</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {["GPS souřadnice se nikdy neukládají", "Soukromé profily jsou rozmazané", "Ghost Mode — úplná neviditelnost", "Příběhy mizí po 24 hodinách"].map((item) => (
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
                Připoj se k lidem kolem tebe dnes
              </div>
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.65)", lineHeight: 1.5, margin: 0 }}>
                Registrace je zdarma a trvá 30 sekund.
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
                Začít zdarma <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/30">
        ahoj app v0.1.0 • Made with 💜 in Brno •{" "}
        <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
        {" · "}
        <Link href="/register" className="hover:text-white/60 transition-colors">Register</Link>
      </footer>
    </div>
  );
}
