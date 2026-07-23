"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { webApi } from "../../../lib/api";
import { getTranslations, type SupportedLanguage } from "../../../locales";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [lang, setLang] = useState<SupportedLanguage>("cs");

  useEffect(() => {
    const saved = localStorage.getItem("ahoj-lang") as SupportedLanguage;
    if (saved) setLang(saved);

    const provider = searchParams.get("provider") || "oauth";
    const code = searchParams.get("code");
    const isMock = searchParams.get("mock") === "true";

    async function handleOAuthCallback() {
      try {
        const mockId = `${provider}_user_${Math.floor(100000 + Math.random() * 900000)}`;
        const mockUsername = `${provider}_${Math.floor(1000 + Math.random() * 900)}`;
        const mockEmail = provider === "wechat" ? null : `${mockUsername}@example.com`;
        const mockBio = `Hello from ${provider.toUpperCase()}`;
        const mockAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${mockUsername}`;

        const data = await webApi.postOAuth({
          provider,
          providerUserId: mockId,
          email: mockEmail,
          username: mockUsername,
          avatarUrl: mockAvatarUrl,
          bio: mockBio,
        });

        localStorage.setItem("accessToken", data.accessToken);
        setStatus("success");

        setTimeout(() => {
          window.location.href = "/app";
        }, 1200);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "OAuth authentication failed");
      }
    }

    handleOAuthCallback();
  }, [searchParams, router]);

  const common = getTranslations(lang).common;

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F2FE]/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C56BFF]/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-6 text-center border border-white/10 relative z-10">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] font-black text-2xl shadow-[0_0_20px_rgba(0,242,254,0.2)]">
          /A\
        </Link>

        {status === "loading" && (
          <div className="space-y-4 py-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#00F2FE]/30 animate-ping" />
              <Loader2 className="w-10 h-10 text-[#00F2FE] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white">Authenticating with OAuth...</h2>
            <p className="text-xs text-white/50">Establishing secure proximity session...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#4CAF50]/20 border border-[#4CAF50] text-[#4CAF50] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Successful!</h2>
            <p className="text-xs text-white/70">Redirecting to your ahoj radar dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#F44336]/20 border border-[#F44336] text-[#F44336] mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
            <p className="text-xs text-[#F44336] font-medium">{errorMsg}</p>
            <div className="pt-2">
              <Link href="/login" className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-block">
                Return to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0C0C0C] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F2FE] animate-spin" />
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
