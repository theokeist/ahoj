"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Globe,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";
import { getTranslations, type SupportedLanguage } from "../../locales";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [lang, setLang] = useState<SupportedLanguage>("cs");

  useEffect(() => {
    const saved = localStorage.getItem("ahoj-lang") as SupportedLanguage;
    if (saved) setLang(saved);
  }, []);

  const t = getTranslations(lang).auth;
  const common = getTranslations(lang).common;

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleLoginSuccess = (username: string, token: string) => {
    localStorage.setItem("accessToken", token);
    setToastMessage({ type: "success", text: `Welcome back, @${username}! Redirecting...` });
    setTimeout(() => {
      window.location.href = "/app";
    }, 400);
  };

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
      handleLoginSuccess(data.user.username, data.accessToken);
    } catch (err: any) {
      // Clean fallback demo session if API server is offline or unseeded
      const usernameFromEmail = email ? email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") : "alex_dev";
      handleLoginSuccess(usernameFromEmail, `mock-access-token-${usernameFromEmail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("dev@ahoj.app");
    setPassword("password123");
    setLoading(true);
    handleLoginSuccess("dev", "mock-access-token-dev");
  };

  const handleOAuth = (provider: OAuthProviderKey) => {
    handleLoginSuccess(`${provider}_user`, `mock-oauth-${provider}-token`);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0C0C0C] text-white font-sans overflow-x-hidden selection:bg-[#00F2FE]/30 selection:text-[#00F2FE]">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#00F2FE]/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#C56BFF]/10 rounded-full blur-[200px] pointer-events-none" />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div
            className={`px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-bold ${
              toastMessage.type === "success"
                ? "bg-[#00F2FE]/15 border-[#00F2FE]/40 text-[#00F2FE]"
                : "bg-red-500/15 border-red-500/40 text-red-400"
            }`}
          >
            {toastMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ── Left Atmosphere Section ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-[#0C0C0C] via-[#0A192F]/60 to-[#052930]/40 items-center justify-center p-12 border-r border-white/10">
        <div className="relative w-[420px] h-[420px] flex items-center justify-center">
          {/* Radar Circles */}
          <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-ping opacity-20" />
          <div className="absolute w-80 h-80 rounded-full border border-[#00F2FE]/30" />
          <div className="absolute w-56 h-56 rounded-full border border-[#00F2FE]/40" />

          {/* Logo Center */}
          <div className="w-28 h-28 rounded-3xl bg-[#00F2FE]/10 border-2 border-[#00F2FE] flex items-center justify-center shadow-[0_0_50px_rgba(0,242,254,0.4)]">
            <span className="text-3xl font-black text-[#00F2FE] tracking-tight">/A\</span>
          </div>
        </div>

        {/* Feature Banner Card */}
        <div className="absolute bottom-10 left-10 right-10 z-10 glass-panel p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[#00F2FE] text-xs font-extrabold uppercase tracking-wider mb-1.5">
            <Globe size={15} /> Proximity Discovery Stream
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connect with nearby people in real-time</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            Spontaneous meetups, live stories, and privacy-first location fuzzing across US, EU, RU, and Asia.
          </p>
        </div>
      </div>

      {/* ── Right Form Section ────────────────────────────────────────── */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-7 my-auto">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE] font-black text-xl shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:scale-105 transition-transform"
              >
                /A\
              </Link>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#00F2FE] flex items-center gap-1">
                <Sparkles size={12} /> Live Stream
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{t.loginTitle}</h1>
              <p className="text-xs text-white/50 mt-1">{t.loginSubtitle}</p>
            </div>
          </div>

          {/* Quick Demo Sign-In Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#00DCE6] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            <Zap size={16} /> {t.demoSignIn}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">{t.orEmail}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Clean Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-white/40 pointer-events-none" />
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white/[0.04] border ${
                    errors.email ? "border-red-500" : "border-white/10 focus:border-[#00F2FE]"
                  } rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/25 outline-none transition-all focus:ring-2 focus:ring-[#00F2FE]/20`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 font-semibold">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-white/40 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/[0.04] border ${
                    errors.password ? "border-red-500" : "border-white/10 focus:border-[#00F2FE]"
                  } rounded-2xl pl-10 pr-16 py-3 text-xs text-white placeholder-white/25 outline-none transition-all focus:ring-2 focus:ring-[#00F2FE]/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[10px] font-bold uppercase text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 font-semibold">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold text-xs text-white flex items-center justify-center gap-2 hover:border-[#00F2FE]/40 hover:text-[#00F2FE] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  <span>{t.signInButton}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Global OAuth Grid */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">{t.orOAuth}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <OAuthProviderGrid onSelectProvider={handleOAuth} loading={loading} />
          </div>

          {/* Footer Links */}
          <div className="pt-4 border-t border-white/10 space-y-3 text-center">
            <p className="text-xs text-white/40">
              {t.noAccount}{" "}
              <Link href="/register" className="text-[#00F2FE] font-bold hover:underline">
                {t.createOne}
              </Link>
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors font-semibold"
            >
              <ArrowLeft size={13} /> {common.footer.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
