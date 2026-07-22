"use client";

import React from "react";
import Link from "next/link";
import {
  Compass, Shield, Flame, Sparkles, ArrowRight,
  Globe, Server, Smartphone, Zap
} from "lucide-react";
import Navigation from "../../components/Navigation";

/**
 * About Page — strictly uses CSS variables from globals.css (mobile theme tokens)
 */
export default function AboutPage() {
  return (
    <div className="page-shell" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Background glows — mobile primary + accent */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "rgba(0,242,254,0.10)",
        filter: "blur(140px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "rgba(255,107,107,0.08)",
        filter: "blur(140px)", pointerEvents: "none",
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
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xxl)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-md)", maxWidth: "44rem", margin: "0 auto" }}>
          <span className="badge-brand">
            <Sparkles style={{ width: 13, height: 13 }} /> Next-Gen Proximity Network
          </span>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, var(--text-hero))",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            margin: 0,
            color: "var(--text-primary)",
          }}>
            About <span style={{ color: "var(--color-primary)" }}>ahoj</span>
          </h1>
          <p style={{ fontSize: "var(--text-md)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "var(--text-primary)" }}>ahoj</strong> is a hyper-local social network built on physical proximity.
            Connect with people right around you, join spontaneous 2-hour meetups, and share expiring stories without permanent digital footprints.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-md)", justifyContent: "center" }}>
            <Link href="/app" className="btn-primary" style={{ padding: "var(--space-md) var(--space-xl)", fontSize: "var(--text-base)", borderRadius: "var(--radius-xl)", textDecoration: "none" }}>
              Launch Web App <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/register" className="btn-ghost" style={{ padding: "var(--space-md) var(--space-xl)", fontSize: "var(--text-base)", borderRadius: "var(--radius-xl)", textDecoration: "none" }}>
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-xl)" }}>

          <div
            className="glass-panel"
            style={{ padding: "var(--space-xl)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border-light)", transition: "border-color 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", backgroundColor: "rgba(0,242,254,0.10)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
              <Compass style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>PostGIS Proximity Radar</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Calculates real-time distance using PostGIS geography queries (<span style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>ST_DWithin</span>). Never exposes exact GPS coordinates.
            </p>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "var(--space-xl)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border-light)", transition: "border-color 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,107,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", backgroundColor: "rgba(255,107,107,0.10)", border: "1px solid rgba(255,107,107,0.30)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
              <Shield style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Ghost Mode & Safe Zones</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Granular privacy controls. Switch to Ghost Mode to fuzz your location telemetry or hide completely from nearby feed scans.
            </p>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "var(--space-xl)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "var(--space-md)", border: "1px solid var(--border-light)", transition: "border-color 0.2s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,179,71,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", backgroundColor: "rgba(255,179,71,0.10)", border: "1px solid rgba(255,179,71,0.30)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-alt)" }}>
              <Flame style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>24h Expiring Stories</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Ephemeral media sharing. Upload photo/video stories pinned to your current location that automatically expire after 24 hours.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-panel" style={{ padding: "var(--space-xxl)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 var(--space-xs)" }}>Architecture & Technology Stack</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>Built as a modern high-performance pnpm monorepo</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-md)" }}>
            {[
              { icon: <Globe style={{ width: 15, height: 15 }} />, label: "Web Frontend", desc: "Next.js 16 (Turbopack), Tailwind CSS v4, Ant Design v5 glassmorphic theme." },
              { icon: <Smartphone style={{ width: 15, height: 15 }} />, label: "Mobile App", desc: "Expo React Native, Expo Router, React Query, Zustand state manager." },
              { icon: <Server style={{ width: 15, height: 15 }} />, label: "Backend Server", desc: "Fastify Node server, Socket.io real-time WebSocket, Drizzle ORM." },
              { icon: <Zap style={{ width: 15, height: 15 }} />, label: "Database & Cache", desc: "PostgreSQL 16 with PostGIS extension, Redis 7 spatial index & pub/sub." },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                style={{
                  padding: "var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-sm)",
                }}
              >
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                  {icon} {label}
                </div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer style={{ borderTop: "1px solid var(--border-light)", padding: "var(--space-xl)", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
        ahoj app v0.1.0 • Made with 💜 in Brno
      </footer>
    </div>
  );
}
