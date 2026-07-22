"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeProvider } from "../../components/ThemeProvider";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";
import { App } from "antd";

/* ── Shared custom input ─────────────────────────────────────────── */
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
          borderColor: error ? "#F44336" : focused ? "#00F2FE" : "rgba(255,255,255,0.10)",
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

/* ── Register Form ───────────────────────────────────────────────── */
function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const validate = () => {
    const e: typeof errors = {};
    if (!username) e.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = "Letters, numbers & underscores only";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Minimum 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      message.success(`Welcome to ahoj, @${data.user.username}!`);
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/app";
    } catch (err: any) {
      message.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: OAuthProviderKey) => {
    setLoading(true);
    message.loading({ content: `Connecting to ${provider.toUpperCase()}...`, key: "oauth" });
    const mockId = `${provider}_user_${Math.floor(100000 + Math.random() * 900000)}`;
    const mockUsername = `${provider}_${Math.floor(1000 + Math.random() * 9000)}`;
    const mockEmail = provider === "wechat" ? null : `${mockUsername}@example.com`;
    const mockBio = "Hello from " + provider.toUpperCase();
    const mockAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${mockUsername}`;
    try {
      const res = await fetch("http://localhost:3000/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, providerUserId: mockId, email: mockEmail, username: mockUsername, avatarUrl: mockAvatarUrl, bio: mockBio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OAuth failed");
      message.success({ content: `Registered as @${data.user.username}!`, key: "oauth" });
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/app";
    } catch (err: any) {
      message.error({ content: err.message || "OAuth failed", key: "oauth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0C0C0C] text-white">

      {/* ── Left: Atmosphere ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0C0C0C] via-[#0A192F] to-[#052930] items-center justify-center p-12 border-r border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.12)_0,transparent_70%)] pointer-events-none" />
        <div className="relative w-80 h-80 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-radar" />
          <div className="absolute w-60 h-60 rounded-full border border-[#00F2FE]/30 animate-pulse" />
          <div className="absolute w-36 h-36 rounded-full border border-[#00F2FE]/20" />
          <div className="w-20 h-20 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center shadow-[0_0_40px_rgba(0,242,254,0.5)]">
            <span className="text-xl font-black text-[#00F2FE]">/A\</span>
          </div>
        </div>

        {/* Feature pills */}
        <div className="absolute inset-x-12 bottom-12 flex flex-col gap-3">
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-lg font-bold text-white">Join the Radar</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Create your account and start discovering people around you instantly.
            </p>
            <div className="flex flex-wrap gap-2">
              {["🌍 Proximity Radar", "💬 E2EE Chat", "⚡ Sparks", "👻 Ghost Mode"].map((f) => (
                <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ─────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-7 my-auto">

          {/* Logo + heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] font-black text-2xl shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              /A\
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Create your account</h1>
              <p className="text-sm text-white/40 mt-1">Free forever · Join nearby friends</p>
            </div>
          </div>

          {/* Custom form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Username"
              placeholder="e.g. alex_24"
              value={username}
              onChange={setUsername}
              error={errors.username}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            />
            <Field
              label="Email"
              type="email"
              placeholder="your@email.com"
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
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
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

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          password.length >= (i + 1) * 3
                            ? i < 1 ? "#F44336" : i < 2 ? "#FF9800" : i < 3 ? "#FFB347" : "#4CAF50"
                            : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/30">
                  {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : password.length < 12 ? "Good" : "Strong"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-[#00F2FE] hover:bg-[#00DCE6] text-black transition-all cursor-pointer disabled:opacity-60 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.45)] hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Creating account…" : "Create Account →"}
            </button>

            <p className="text-center text-[11px] text-white/25">
              By registering you agree to our Terms of Service
            </p>
          </form>

          {/* OAuth */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-medium">or sign up with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <OAuthProviderGrid onSelectProvider={handleOAuth} loading={loading} />
          </div>

          <p className="text-center text-xs text-white/35">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00F2FE] hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ThemeProvider>
      <App>
        <RegisterForm />
      </App>
    </ThemeProvider>
  );
}
