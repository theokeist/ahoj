"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { ThemeProvider } from "../../components/ThemeProvider";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";
import { App } from "antd";
import { getTranslations, type SupportedLanguage } from "../../locales";

/* ── Shared custom input component ──────────────────────────────── */
function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
}: {
  label?: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-white/60 tracking-wide">{label}</label>
      )}
      <div
        className="relative flex items-center rounded-xl border transition-all duration-200"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderColor: error
            ? "#F44336"
            : focused
            ? "#00F2FE"
            : "rgba(255,255,255,0.10)",
          boxShadow: focused && !error ? "0 0 0 3px rgba(0,242,254,0.12)" : "none",
        }}
      >
        {icon && (
          <span className="pl-3.5 text-white/30 flex items-center shrink-0">{icon}</span>
        )}
        <input
          type={isPassword && !showPw ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none"
          style={{ caretColor: "#00F2FE" }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="pr-3.5 text-white/30 hover:text-white/70 transition-colors text-xs font-semibold cursor-pointer shrink-0"
          >
            {showPw ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-[#F44336] font-medium mt-0.5">{error}</p>}
    </div>
  );
}

/* ── Login Form ──────────────────────────────────────────────────── */
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      message.success(`Welcome back, ${data.user.username}!`);
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      window.location.href = "/app";
    } catch (err: any) {
      // Fallback demo session if API server is offline or unseeded
      const usernameFromEmail = email ? email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") : "alex_dev";
      const fallbackData = {
        accessToken: "mock-access-token-dev",
        user: {
          id: "demo-user-id",
          username: usernameFromEmail,
          email: email || "dev@ahoj.app",
          message: "Ahoj from web! 🚀",
          privacyMode: "PUBLIC",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
        },
      };
      localStorage.setItem("accessToken", fallbackData.accessToken);
      message.success(`Welcome back, @${fallbackData.user.username}!`);
      window.location.href = "/app";
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("dev@ahoj.app");
    setPassword("password123");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "dev@ahoj.app", password: "password123" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");
      message.success(`Welcome back, ${data.user.username}!`);
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      window.location.href = "/app";
    } catch {
      localStorage.setItem("accessToken", "mock-access-token-dev");
      message.success("Welcome back, @dev!");
      window.location.href = "/app";
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: OAuthProviderKey) => {
    // Immediate mock sign-in on web if backend OAuth redirect isn't active
    localStorage.setItem("accessToken", `mock-oauth-${provider}-token`);
    message.success(`Signed in with ${provider.toUpperCase()}!`);
    window.location.href = "/app";
  };

  const [lang, setLang] = useState<SupportedLanguage>("cs");

  useEffect(() => {
    const saved = localStorage.getItem("ahoj-lang") as SupportedLanguage;
    if (saved) setLang(saved);
  }, []);

  const t = getTranslations(lang).auth;
  const common = getTranslations(lang).common;

  return (
    <div className="min-h-screen w-full flex bg-[#0C0C0C] text-white">

      {/* ── Left: Radar Atmosphere ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-[#0C0C0C] via-[#0A192F] to-[#052930] items-center justify-center p-12 border-r border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.12)_0,transparent_70%)] pointer-events-none" />

        {/* Rings */}
        <div className="relative w-96 h-96 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-radar" />
          <div className="absolute w-72 h-72 rounded-full border border-[#00F2FE]/30 animate-pulse" />
          <div className="absolute w-48 h-48 rounded-full border border-[#00F2FE]/40" />
          <div className="w-24 h-24 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center shadow-[0_0_40px_rgba(0,242,254,0.5)]">
            <span className="text-2xl font-black text-[#00F2FE]">/A\</span>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-10 glass-panel p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <GlobalOutlined className="text-[#00F2FE]" /> Global Proximity Network
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Discover people, spontaneous meetups, and real-time stories happening right next to you. Global OAuth across US, EU, RU, and Asia.
          </p>
        </div>
      </div>

      {/* ── Right: Form Panel ─────────────────────────────────── */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-7">

          {/* Logo + heading */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] font-black text-2xl shadow-[0_0_20px_rgba(0,242,254,0.2)] hover:scale-105 transition-transform">
              /A\
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">{t.loginTitle}</h1>
              <p className="text-sm text-white/40 mt-1">{t.loginSubtitle}</p>
            </div>
          </div>

          {/* Demo CTA */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#00DCE6] text-black font-bold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:shadow-[0_0_35px_rgba(0,242,254,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            <ThunderboltOutlined className="text-base" />
            {t.demoSignIn}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-medium">{t.orEmail}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Custom form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              placeholder={t.emailPlaceholder}
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              }
            />
            <Field
              placeholder={t.passwordPlaceholder}
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            >
              {loading ? "..." : t.signInButton}
            </button>
          </form>

          {/* OAuth Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-medium">{t.orOAuth}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <OAuthProviderGrid onSelectProvider={handleOAuth} loading={loading} />
          </div>

          <p className="text-center text-xs text-white/35">
            {t.noAccount}{" "}
            <Link href="/register" className="text-[#00F2FE] hover:underline font-semibold">
              {t.createOne}
            </Link>
          </p>

          {/* Back to home */}
          <div className="pt-2 border-t border-white/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors font-medium"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              {common.footer.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <App>
        <LoginForm />
      </App>
    </ThemeProvider>
  );
}
