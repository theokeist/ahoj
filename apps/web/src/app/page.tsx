"use client";

import React from "react";
import Link from "next/link";
import { Compass, Shield, Flame, Sparkles, ArrowRight } from "lucide-react";
import Navigation from "../components/Navigation";
import { MOCK_NEARBY_USERS } from "../lib/mockData";

/**
 * Landing Page — strictly uses CSS variables from globals.css
 * No raw hex values; all colors reference mobile theme tokens
 */
export default function WelcomingLandingPage() {
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Atmospheric background glows (mobile primary + accent colors) */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "rgba(0,242,254,0.12)",  /* colors.primary at 12% */
        filter: "blur(120px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "rgba(255,107,107,0.10)", /* colors.accent at 10% */
        filter: "blur(120px)",
        pointerEvents: "none",
      }} />

      <Navigation />

      <main style={{
        flex: 1,
        maxWidth: "80rem",
        width: "100%",
        margin: "0 auto",
        padding: "8rem var(--space-xl) var(--space-xxl)",
        position: "relative",
        zIndex: 10,
      }}>

        {/* Hero Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-xxl)", alignItems: "center" }} className="lg:grid-cols-hero">

          {/* Left: Text & CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>

            {/* Pill badge */}
            <div style={{ display: "inline-flex", alignSelf: "flex-start" }}>
              <span className="badge-brand" style={{ fontSize: "var(--text-xs)" }}>
                <Sparkles style={{ width: 12, height: 12 }} />
                Next-Gen Proximity Social Network
              </span>
            </div>

            {/* Hero headline */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 6vw, var(--text-hero))",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              margin: 0,
              background: "linear-gradient(135deg, var(--text-primary) 0%, var(--color-primary-light) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Spoj se s lidmi,<br />kteří jsou blízko.
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: "var(--text-md)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "38rem",
            }}>
              <strong style={{ color: "var(--text-primary)" }}>ahoj</strong> je hyperlokální sociální síť stavící na reálné blízkosti.
              Zjisti, kdo je v tvém dosahu, prohlížej si mizející příběhy a začni chatovat jen s lidmi v tvém okolí.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-md)", paddingTop: "var(--space-sm)" }}>
              <Link
                href="/app"
                className="btn-primary"
                style={{
                  padding: "var(--space-md) var(--space-xl)",
                  fontSize: "var(--text-base)",
                  borderRadius: "var(--radius-xl)",
                  textDecoration: "none",
                  boxShadow: "var(--glow-primary-strong)",
                }}
              >
                Launch Web App <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>

              <Link
                href="/login"
                className="btn-ghost"
                style={{
                  padding: "var(--space-md) var(--space-xl)",
                  fontSize: "var(--text-base)",
                  borderRadius: "var(--radius-xl)",
                  textDecoration: "none",
                }}
              >
                Sign In / Register
              </Link>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: 280,
              height: 560,
              borderRadius: 40,
              border: "7px solid var(--border-light)",
              backgroundColor: "var(--bg-secondary)",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.9)",
              padding: "var(--space-sm)",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Notch */}
              <div style={{
                position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                width: 100, height: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: "var(--radius-full)",
                zIndex: 20,
              }} />

              {/* Simulated App Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "var(--space-lg) var(--space-sm) var(--space-sm)",
                borderBottom: "1px solid var(--border-light)",
                marginTop: "var(--space-md)",
              }}>
                <span style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: "var(--color-primary)" }}>/A\</span>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-primary)" }}>Live Radar</span>
                <span style={{ fontSize: 10, color: "var(--color-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--color-primary)", display: "inline-block" }} />
                  Active
                </span>
              </div>

              {/* Nearby Feed */}
              <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-sm)", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {MOCK_NEARBY_USERS.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      padding: "var(--space-sm) var(--space-sm)",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                      <img src={user.avatarUrl} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{user.username}</div>
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.message}</div>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--color-primary)", flexShrink: 0 }}>~{user.distanceMeters}m</span>
                  </div>
                ))}
              </div>

              {/* Simulated Bottom Nav */}
              <div style={{
                height: 44,
                borderTop: "1px solid var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                fontSize: 11,
                color: "var(--text-tertiary)",
              }}>
                <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>🌍 Radar</span>
                <span>⚡ Sparks</span>
                <span>💬 Chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-xl)",
          paddingTop: "var(--space-xxl)",
          borderTop: "1px solid var(--border-light)",
          marginTop: "var(--space-xxl)",
        }}>

          {/* Proximity Radar */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
              border: "1px solid var(--border-light)",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
          >
            <div style={{
              width: 44, height: 44,
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(0,242,254,0.10)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-primary)",
            }}>
              <Compass style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Proximity Radar</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Objevuj lidi v reálném čase podle své aktuální polohy. Změň dosah vyhledávání od 500 metrů do 5 kilometrů.
            </p>
          </div>

          {/* Privacy Protection */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
              border: "1px solid var(--border-light)",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,107,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
          >
            <div style={{
              width: 44, height: 44,
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(255,107,107,0.10)",
              border: "1px solid rgba(255,107,107,0.30)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-accent)",
            }}>
              <Shield style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Ochrana soukromí</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Granulární soukromí. Soukromé účty jsou ve feedu rozmazané a vyžadují schválení. Nebo zapni Ghost Mode.
            </p>
          </div>

          {/* Disappearing Stories */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
              border: "1px solid var(--border-light)",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,179,71,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
          >
            <div style={{
              width: 44, height: 44,
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(255,179,71,0.10)",
              border: "1px solid rgba(255,179,71,0.30)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-accent-alt)",
            }}>
              <Flame style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Mizející příběhy</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Příběhy mizí po 24 hodinách. Sdílej bez obav z permanentní digitální stopy jen to, co tě baví právě teď.
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-light)",
        padding: "var(--space-xl)",
        textAlign: "center",
        fontSize: "var(--text-xs)",
        color: "var(--text-tertiary)",
      }}>
        ahoj app v0.1.0 • Made with 💜 in Brno
      </footer>
    </div>
  );
}
