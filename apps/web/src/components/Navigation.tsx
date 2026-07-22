"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";

/**
 * Navigation — uses only CSS variables from globals.css (mobile theme aligned)
 * No raw hex values; all colors reference --color-primary, --bg-primary, --border-light, etc.
 */
export default function Navigation() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: "var(--bg-overlay)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 var(--space-lg)",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", textDecoration: "none" }}>
          <span
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 900,
              color: "var(--color-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            /A\
          </span>
          <span
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            ahoj
          </span>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-xl)" }}>
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: pathname === href ? "var(--color-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/app"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: pathname === "/app" ? "var(--color-primary)" : "var(--text-secondary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              transition: "color 0.15s ease",
            }}
          >
            <Compass style={{ width: 14, height: 14, color: "var(--color-primary)" }} />
            Web App
          </Link>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              padding: "6px var(--space-md)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              textDecoration: "none",
              transition: "border-color 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="btn-primary"
            style={{
              padding: "6px var(--space-md)",
              fontSize: "var(--text-xs)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
            }}
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
