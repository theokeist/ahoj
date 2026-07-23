"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Compass,
  MessageSquare,
  User,
  Shield,
  Flame,
  Send,
  Plus,
  Lock,
  Sparkles,
  Check,
  Ghost,
  LogOut,
  ChevronRight,
  X,
  Camera,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  Radio,
  Image as ImageIcon,
  CheckCircle2,
  Settings,
  Sliders,
  Bell,
  Key,
  Globe,
  Save,
  Zap,
  Search,
  MapPin,
  TrendingUp,
  Share2,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { webApi } from "../../lib/api";
import { MOCK_NEARBY_USERS } from "../../lib/mockData";
import { getTranslations, type SupportedLanguage } from "../../locales";

const STORY_FILTERS = [
  { id: "none", name: "Original 📷" },
  { id: "beauty", name: "Beauty Glow 💄" },
  { id: "bokeh", name: "Portrait Bokeh 🤖" },
  { id: "greenscreen", name: "Green Screen 🌿" },
  { id: "cyber", name: "Cyberpunk ⚡" },
  { id: "retro", name: "Retro 📻" },
  { id: "neon", name: "Neon 🌅" },
  { id: "noir", name: "Noir B&W 🖤" },
];

const EMOJI_STICKERS = ["📍 Brno", "⚡ Spark", "🔥 Hot", "☕ Coffee", "🏔️ Trip", "🎧 Vibe", "🎉 Party"];

export default function FullWebAppDashboard() {
  const router = useRouter();

  // Language & i18n
  const [language, setLanguage] = useState<SupportedLanguage>("cs");

  useEffect(() => {
    const saved = localStorage.getItem("ahoj-lang") as SupportedLanguage;
    if (saved) setLanguage(saved);
    const handleLangChange = (e: any) => {
      if (e.detail) setLanguage(e.detail as SupportedLanguage);
    };
    window.addEventListener("ahoj-lang-change", handleLangChange);
    return () => window.removeEventListener("ahoj-lang-change", handleLangChange);
  }, []);

  const t = getTranslations(language).dashboard;
  const common = getTranslations(language).common;

  // Auth Guard & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [myUser, setMyUser] = useState<any>(null);

  // App Navigation & View Modes
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "requests" | "settings">("feed");
  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");
  const [radiusKm, setRadiusKm] = useState<number>(3);

  // Data collections
  const [nearbyUsers, setNearbyUsers] = useState<any[]>(MOCK_NEARBY_USERS);
  const [sparks, setSparks] = useState<any[]>([
    { id: "s1", username: "tomas_p", category: "SPORTS", title: "Spontaneous 3v3 Basketball 🏀", distanceMeters: 450, description: "Looking for 2 players at Kravi Hora courts!" },
    { id: "s2", username: "karolina_v", category: "COFFEE", title: "Specialty Coffee & Chat ☕", distanceMeters: 320, description: "Working at Skog Urban Hub for 2 hours." },
    { id: "s3", username: "ondrej_f", category: "PARTY", title: "Impromptu Acoustic Jam 🎸", distanceMeters: 880, description: "Bring your guitar or synth!" },
  ]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // Google+ +1 Interaction State
  const [plusOneState, setPlusOneState] = useState<Record<string, { count: number; clicked: boolean }>>({
    u1: { count: 14, clicked: false },
    u2: { count: 8, clicked: false },
    u3: { count: 21, clicked: true },
    u4: { count: 5, clicked: false },
  });

  const handleTogglePlusOne = (userId: string) => {
    setPlusOneState((prev) => {
      const current = prev[userId] || { count: Math.floor(Math.random() * 15) + 2, clicked: false };
      return {
        ...prev,
        [userId]: {
          count: current.clicked ? current.count - 1 : current.count + 1,
          clicked: !current.clicked,
        },
      };
    });
  };

  // Story Creator & Camera Modal
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [activeStickers, setActiveStickers] = useState<string[]>([]);
  const [selectedStoryUser, setSelectedStoryUser] = useState<any>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Spark Creator Modal
  const [isCreateSparkOpen, setIsCreateSparkOpen] = useState(false);
  const [newSparkTitle, setNewSparkTitle] = useState("");
  const [newSparkCategory, setNewSparkCategory] = useState("COFFEE");

  // Immediate Save Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    username: "",
    message: "Ahoj!",
    bio: "",
    avatarUrl: "",
    privacyMode: "PUBLIC",
    ghostFuzzRadiusMeters: 300,
    allowDirectMessages: "EVERYONE",
    showDistanceToOthers: true,
    notifications: {
      pushEnabled: true,
      nearbyUsersAlert: true,
      sparksAlert: true,
      messagesAlert: true,
      accessRequestAlert: true,
      soundEnabled: true,
    },
    language: "cs",
    distanceUnit: "metric",
    autoPlayVideos: "wifi",
    mediaUploadQuality: "high",
  });
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Socket
  const socketRef = useRef<Socket | null>(null);

  // Initial Load & Auth Check
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthenticated(false);
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);

    webApi.getMe()
      .then((data) => {
        setMyUser(data.user);
        setSettingsForm((prev) => ({
          ...prev,
          username: data.user.username || "",
          message: data.user.message || "Ahoj!",
          bio: data.user.bio || "",
          avatarUrl: data.user.profilePhotoUrl || "",
          privacyMode: data.user.privacyMode || "PUBLIC",
        }));
      })
      .catch(() => {});

    webApi.getSettings()
      .then((settings) => {
        if (settings) {
          setSettingsForm((prev) => ({
            ...prev,
            privacyMode: settings.privacyMode ?? prev.privacyMode,
            ghostFuzzRadiusMeters: settings.ghostFuzzRadiusMeters ?? prev.ghostFuzzRadiusMeters,
            allowDirectMessages: settings.allowDirectMessages ?? prev.allowDirectMessages,
            showDistanceToOthers: settings.showDistanceToOthers ?? true,
            notifications: settings.notifications ?? prev.notifications,
            language: settings.language ?? prev.language,
            distanceUnit: settings.distanceUnit ?? "metric",
            autoPlayVideos: settings.autoPlayVideos ?? "wifi",
            mediaUploadQuality: settings.mediaUploadQuality ?? "high",
          }));
          if (settings.language) {
            setLanguage(settings.language as SupportedLanguage);
            localStorage.setItem("ahoj-lang", settings.language);
          }
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        router.replace("/login");
      });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadAppData(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          loadAppData(49.1951, 16.6078);
        }
      );
    } else {
      loadAppData(49.1951, 16.6078);
    }
  }, [router]);

  const loadAppData = async (lat = 49.1951, lng = 16.6078) => {
    try {
      const feedRes = await webApi.getNearbyUsers(lat, lng, radiusKm * 1000);
      if (feedRes.users && feedRes.users.length) {
        setNearbyUsers(feedRes.users);
      }
    } catch {}

    try {
      const sparksRes = await webApi.getSparks(lat, lng, radiusKm * 1000);
      if (sparksRes.sparks && sparksRes.sparks.length) {
        setSparks(sparksRes.sparks);
      }
    } catch {}

    try {
      const convRes = await webApi.getConversations();
      if (convRes.conversations) setConversations(convRes.conversations);
    } catch {}

    try {
      const reqRes = await webApi.getIncomingRequests();
      if (reqRes.requests) setIncomingRequests(reqRes.requests);
    } catch {}
  };

  // Immediate Save Handler for Settings
  const handleImmediateSettingChange = async (key: string, value: any) => {
    const isNested = key.includes(".");
    let updatedForm = { ...settingsForm };

    if (isNested) {
      const [parent, child] = key.split(".");
      updatedForm = {
        ...updatedForm,
        [parent]: {
          ...(updatedForm as any)[parent],
          [child]: value,
        },
      };
    } else {
      updatedForm = { ...updatedForm, [key]: value };
    }

    setSettingsForm(updatedForm);

    if (key === "language") {
      setLanguage(value as SupportedLanguage);
      localStorage.setItem("ahoj-lang", value);
      window.dispatchEvent(new CustomEvent("ahoj-lang-change", { detail: value }));
    }

    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 2000);

    try {
      await webApi.updateSettings(updatedForm);
      if (key === "username" || key === "bio" || key === "avatarUrl" || key === "privacyMode") {
        await webApi.updateProfile({
          username: updatedForm.username,
          bio: updatedForm.bio,
          profilePhotoUrl: updatedForm.avatarUrl,
          privacyMode: updatedForm.privacyMode,
        });
      }
      if (key === "message") {
        await webApi.updateMessage(updatedForm.message);
      }
    } catch {}
  };

  // Socket setup
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("location:update", { lat: 49.1951, lng: 16.6078 });
    });

    socket.on("feed:update", (users: any[]) => {
      if (users && users.length) setNearbyUsers(users);
    });

    socket.on("message:new", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeChatUser) return;
    try {
      const res = await webApi.sendMessage(activeChatUser.id, text);
      setMessages((prev) => [...prev, res.message]);
      setTypedMessage("");
    } catch {}
  };

  const handleCreateSpark = async () => {
    if (!newSparkTitle.trim()) return;
    try {
      const res = await webApi.createSpark({
        title: newSparkTitle,
        category: newSparkCategory,
        lat: 49.1951,
        lng: 16.6078,
      });
      setSparks((prev) => [res.spark, ...prev]);
      setIsCreateSparkOpen(false);
      setNewSparkTitle("");
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  const isGhostMode = settingsForm.privacyMode === "GHOST";

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] animate-pulse">
            <span className="text-xl font-black text-[#00F2FE]">/A\</span>
          </div>
          <span className="text-xs font-semibold text-white/50">Loading ahoj stream...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex font-sans overflow-x-hidden">

      {/* Background Atmosphere Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F2FE]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C56BFF]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* ── 1. LEFT SIDEBAR NAVIGATION (X / Twitter Style) ────────────────────────── */}
      <aside className="w-64 lg:w-72 h-screen sticky top-0 border-r border-white/10 p-5 flex flex-col justify-between z-30 bg-[#0C0C0C]/80 backdrop-blur-xl shrink-0 hidden md:flex">
        
        <div className="space-y-7">
          {/* Top-Left Logo & User Avatar Profile Header */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 px-2 group select-none">
              <div className="w-11 h-11 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE] font-black text-2xl shadow-[0_0_20px_rgba(0,242,254,0.2)] group-hover:scale-105 transition-transform">
                /A\
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white group-hover:text-[#00F2FE] transition-colors">ahoj</span>
                <div className="text-[10px] text-[#00F2FE] font-bold uppercase tracking-wider">Proximity Stream</div>
              </div>
            </Link>

            {/* Top-Left User Avatar Card */}
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className="w-full glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-[#00F2FE]/40 transition-all text-left group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={myUser?.avatarUrl || settingsForm.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                  alt="Profile"
                  className="w-10 h-10 rounded-2xl object-cover border border-[#00F2FE]/60 group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00F2FE] border-2 border-[#0C0C0C]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-white truncate group-hover:text-[#00F2FE] transition-colors">
                  @{myUser?.username || settingsForm.username || "alex"}
                </div>
                <div className="text-[10px] text-white/50 truncate">&quot;{settingsForm.message}&quot;</div>
              </div>
              <ChevronRight size={14} className="text-white/30 group-hover:text-[#00F2FE] transition-colors" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: "feed", label: t.radarTitle, icon: <Compass size={20} />, count: (nearbyUsers || []).length },
              { id: "sparks", label: t.sparksTitle, icon: <Flame size={20} />, count: (sparks || []).length },
              { id: "chats", label: t.chatsTitle, icon: <MessageSquare size={20} />, count: (conversations || []).length },
              { id: "requests", label: t.requestsTitle, icon: <Lock size={20} />, count: incomingRequests?.length || 0 },
              { id: "settings", label: t.settingsTitle, icon: <Settings size={20} />, count: null },
            ].map(({ id, label, icon, count }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#00F2FE]/20 to-[#00DCE6]/5 text-[#00F2FE] border border-[#00F2FE]/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]"
                      : "text-white/70 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? "text-[#00F2FE]" : "text-white/50"}>{icon}</span>
                    <span>{label}</span>
                  </div>
                  {count !== null && count > 0 && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? "bg-[#00F2FE] text-black font-bold" : "bg-white/10 text-white/70"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Button (Create Spark / Post) */}
          <button
            type="button"
            onClick={() => setIsCreateSparkOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} /> {t.createSpark}
          </button>
        </div>

        {/* User Profile Footer Card */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={myUser?.avatarUrl || settingsForm.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="Profile"
              className="w-10 h-10 rounded-2xl object-cover border border-[#00F2FE]/40 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-xs text-white truncate">@{myUser?.username || settingsForm.username || "alex"}</div>
              <div className="text-[10px] text-white/50 truncate">&quot;{settingsForm.message}&quot;</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={common.nav.signOut}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

      </aside>

      {/* ── 2. CENTER STREAM COLUMN (Google+ Card Stream + X Timeline) ───────────── */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen border-r border-white/10 relative z-20">

        {/* Sticky Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0C0C0C]/80 backdrop-blur-xl border-b border-white/10 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white capitalize">
              {activeTab === "feed" && t.radarTitle}
              {activeTab === "sparks" && t.sparksTitle}
              {activeTab === "chats" && t.chatsTitle}
              {activeTab === "requests" && t.requestsTitle}
              {activeTab === "settings" && t.settingsTitle}
            </h2>
            {isGhostMode && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/40 text-[10px] font-bold flex items-center gap-1">
                <Ghost size={10} /> Ghost Mode
              </span>
            )}
          </div>

          {/* View Mode Switcher for Feed */}
          {activeTab === "feed" && (
            <div className="flex items-center gap-2">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === "grid" ? "bg-[#00F2FE] text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  <LayoutGrid size={13} /> {t.grid}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("radar")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === "radar" ? "bg-[#00F2FE] text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Radio size={13} /> {t.radar}
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ── Horizontal Story Circles Carousel (Google+ Circles style) ──────── */}
        <div className="p-4 border-b border-white/10 overflow-x-auto scrollbar-none flex items-center gap-4 bg-white/[0.01]">
          {/* Add Story Button */}
          <button
            type="button"
            onClick={() => setIsStoryModalOpen(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-[#00F2FE]/10 border-2 border-dashed border-[#00F2FE]/50 flex items-center justify-center text-[#00F2FE] group-hover:scale-105 transition-transform">
              <Camera size={20} />
            </div>
            <span className="text-[10px] font-bold text-white/70">Add Story</span>
          </button>

          {/* Story Circles */}
          {nearbyUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setSelectedStoryUser(u);
                setStoryProgress(0);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#00F2FE] to-[#FF6B6B] group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                <img
                  src={u.avatarUrl}
                  alt={u.username}
                  className="w-full h-full rounded-full object-cover border-2 border-[#0C0C0C]"
                />
              </div>
              <span className="text-[10px] font-semibold text-white/80 truncate w-14 text-center">@{u.username}</span>
            </button>
          ))}
        </div>

        {/* ── Content Tab Views ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* TAB 1: NEARBY RADAR STREAM */}
          {activeTab === "feed" && (
            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
              
              {/* Composer Box (X / Twitter style) */}
              <div className="glass-panel p-4 rounded-3xl space-y-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={myUser?.avatarUrl || settingsForm.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-2xl object-cover border border-[#00F2FE]/40"
                  />
                  <input
                    type="text"
                    placeholder="What's happening nearby in Brno?"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/40 font-medium"
                    onClick={() => setIsCreateSparkOpen(true)}
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-[#00F2FE]">
                    <button type="button" onClick={() => setIsStoryModalOpen(true)} className="p-2 rounded-xl hover:bg-[#00F2FE]/10 flex items-center gap-1">
                      <Camera size={15} /> Photo Story
                    </button>
                    <button type="button" onClick={() => setIsCreateSparkOpen(true)} className="p-2 rounded-xl hover:bg-[#00F2FE]/10 flex items-center gap-1">
                      <Flame size={15} /> Spark
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateSparkOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-[#00F2FE] text-black font-bold text-xs hover:scale-105 transition-all"
                  >
                    Post Spark
                  </button>
                </div>
              </div>

              {/* Multi-Card Stream (Modern Google+ Card Stream) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {nearbyUsers.map((user) => {
                  const pOne = plusOneState[user.id] || { count: 12, clicked: false };

                  return (
                    <article
                      key={user.id}
                      className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10 hover:border-[#00F2FE]/40 transition-all flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] group bg-[#0C0C0C]/60 backdrop-blur-xl"
                    >
                      {/* Google+ Card Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-11 h-11 rounded-full object-cover border-2 border-[#00F2FE]/60 group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00F2FE] border-2 border-[#0C0C0C]" />
                            </div>

                            <div>
                              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                                @{user.username}
                                {user.privacyMode === "PRIVATE" && <Lock size={12} className="text-amber-400" />}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-white/50">
                                <span className="text-[#00F2FE] font-mono font-semibold flex items-center gap-1">
                                  <MapPin size={11} /> ~{user.distanceMeters}m
                                </span>
                                <span>·</span>
                                <span className="text-white/40">{user.lastActive || "2m ago"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 flex items-center gap-1">
                              <Sparkles size={11} className="text-[#00F2FE]" /> Circle Stream
                            </span>
                            <button type="button" className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                              <MoreHorizontal size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Google+ Post Text Content */}
                        <div className="text-xs text-white/90 leading-relaxed font-normal bg-white/[0.03] p-4 rounded-2xl border border-white/5 space-y-2">
                          <p className="italic">&ldquo;{user.message}&rdquo;</p>

                          {/* Media Preview Attachment (Google+ Media Card) */}
                          {user.stories && user.stories.length > 0 && (
                            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 group/img">
                              <img
                                src={user.stories[0]}
                                alt="Post attachment"
                                className="w-full h-36 object-cover group-hover/img:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/20">
                                📷 Photo Attachment
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Google+ Social Action Bar (Bottom Toolbar) */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        {/* Left Actions: +1 Button & Reshare */}
                        <div className="flex items-center gap-2">
                          {/* Google+ +1 Interactive Button */}
                          <button
                            type="button"
                            onClick={() => handleTogglePlusOne(user.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                              pOne.clicked
                                ? "bg-[#00F2FE] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)] scale-105"
                                : "bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 hover:bg-[#00F2FE]/20"
                            }`}
                          >
                            <span>+1</span>
                            <span className="text-[11px] font-mono">{pOne.count}</span>
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
                            title="Reshare post"
                          >
                            <Share2 size={14} />
                          </button>
                        </div>

                        {/* Right Action: Direct Message / Request */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatUser(user);
                            setActiveTab("chats");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageSquare size={13} className="text-[#00F2FE]" /> {t.chatBtn}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: SPARKS MEETUPS */}
          {activeTab === "sparks" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{t.sparksTitle}</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateSparkOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                >
                  <Plus size={15} /> {t.createSpark}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sparks.map((spark) => (
                  <div key={spark.id} className="glass-panel p-5 rounded-3xl space-y-3 border border-white/10 hover:border-[#00F2FE]/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-[#00F2FE]/15 text-[#00F2FE] font-bold px-2.5 py-1 rounded-full border border-[#00F2FE]/30 uppercase tracking-wider">
                        {spark.category}
                      </span>
                      <span className="text-[11px] text-white/50 font-mono font-semibold">~{spark.distanceMeters}m away</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{spark.title}</h4>
                    <p className="text-xs text-white/70 leading-relaxed">{spark.description || "Spontaneous meetup created nearby."}</p>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/40 text-[11px]">Created by @{spark.username}</span>
                      <button type="button" className="px-3.5 py-1.5 rounded-xl bg-[#00F2FE] text-black font-bold text-xs hover:scale-105 transition-all">
                        {t.joinSpark}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: E2EE CHATS */}
          {activeTab === "chats" && (
            <div className="h-[calc(100vh-65px)] flex">
              <div className="w-72 border-r border-white/10 p-3 space-y-2 overflow-y-auto">
                <div className="text-xs font-bold text-white/50 uppercase tracking-wider px-2 py-1">{t.chatsTitle}</div>
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChatUser(c.partner)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all ${
                      activeChatUser?.id === c.partner.id ? "bg-[#00F2FE]/15 border-[#00F2FE]/40" : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">@{c.partner.username}</div>
                    <div className="text-[10px] text-white/50 truncate">{c.lastMessage || "Encrypted thread"}</div>
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col bg-[#0C0C0C]">
                {activeChatUser ? (
                  <>
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                      <div className="font-bold text-sm text-white">@{activeChatUser.username}</div>
                      <span className="text-xs text-[#4CAF50] font-semibold flex items-center gap-1 bg-[#4CAF50]/10 px-2.5 py-1 rounded-full border border-[#4CAF50]/30">
                        <Lock size={12} /> {t.e2eeNotice}
                      </span>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.senderId === myUser?.id ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs ${
                            m.senderId === myUser?.id ? "bg-[#00F2FE] text-black font-semibold shadow-[0_0_15px_rgba(0,242,254,0.2)]" : "bg-white/10 text-white"
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-white/10 flex gap-2 bg-white/[0.02]">
                      <input
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage(typedMessage);
                            setTypedMessage("");
                          }
                        }}
                        placeholder={t.typeMessage}
                        className="flex-1 glass-input px-4 py-3 rounded-2xl text-xs text-white placeholder-white/40"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleSendMessage(typedMessage);
                          setTypedMessage("");
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#00F2FE] text-black font-bold text-xs hover:scale-105 transition-all"
                      >
                        {t.send}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/40 text-xs font-medium space-y-2">
                    <MessageSquare size={32} className="mx-auto text-white/20" />
                    <p>Select a conversation to start chat</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS REQUESTS */}
          {activeTab === "requests" && (
            <div className="p-6 space-y-4">
              <div className="text-xs font-bold text-white/60 uppercase tracking-wider">{t.requestsTitle}</div>
              {incomingRequests.length ? (
                incomingRequests.map((req) => (
                  <div key={req.id} className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center font-bold text-sm text-[#00F2FE]">
                        {req.requesterUsername?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">@{req.requesterUsername}</div>
                        <div className="text-[10px] text-white/40">Requested access to private profile & stories</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => webApi.approveAccess(req.id).then(() => loadAppData())} className="px-4 py-2 rounded-xl bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/40 font-bold text-xs">{t.approve}</button>
                      <button type="button" onClick={() => webApi.denyAccess(req.id).then(() => loadAppData())} className="px-4 py-2 rounded-xl bg-[#F44336]/20 text-[#F44336] border border-[#F44336]/40 font-bold text-xs">{t.deny}</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-white/40 text-xs font-medium space-y-2">
                  <Lock size={32} className="mx-auto text-white/20" />
                  <p>{t.noRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: APP SETTINGS PAGE (IMMEDIATE SAVE) */}
          {activeTab === "settings" && (
            <div className="p-6 space-y-6">

              {settingsSaveSuccess && (
                <div className="p-4 rounded-2xl bg-[#4CAF50]/20 border border-[#4CAF50] text-[#4CAF50] text-xs font-bold flex items-center gap-2 animate-fadeIn sticky top-16 z-30 shadow-lg backdrop-blur-md">
                  <CheckCircle2 size={16} /> {t.savedToast}
                </div>
              )}

              {/* Profile & Identity */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <User size={16} /> {t.profileSection}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.username}</label>
                    <input
                      type="text"
                      value={settingsForm.username}
                      onChange={(e) => handleImmediateSettingChange("username", e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                      placeholder={t.username}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.statusMessage}</label>
                    <input
                      type="text"
                      value={settingsForm.message}
                      onChange={(e) => handleImmediateSettingChange("message", e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                      placeholder={t.statusMessage}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">{t.bio}</label>
                  <textarea
                    rows={2}
                    value={settingsForm.bio}
                    onChange={(e) => handleImmediateSettingChange("bio", e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                    placeholder={t.bio}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">{t.avatarUrl}</label>
                  <input
                    type="text"
                    value={settingsForm.avatarUrl}
                    onChange={(e) => handleImmediateSettingChange("avatarUrl", e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-2xl text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Privacy & Location Modes */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Shield size={16} /> {t.privacySection}
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Proximity Visibility</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "PUBLIC", label: t.privacyPublic, desc: t.privacyPublicDesc },
                      { id: "GHOST", label: t.privacyGhost, desc: t.privacyGhostDesc },
                      { id: "PRIVATE", label: t.privacyPrivate, desc: t.privacyPrivateDesc },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleImmediateSettingChange("privacyMode", mode.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                          settingsForm.privacyMode === mode.id
                            ? "bg-[#00F2FE] text-black border-[#00F2FE] font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                            : "bg-[#121212] border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className="text-[10px] opacity-70 mt-1">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ghost Fuzzing Radius */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-white/70">
                    <span>{t.ghostFuzz}</span>
                    <span className="text-[#00F2FE] font-bold">{settingsForm.ghostFuzzRadiusMeters}m</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={settingsForm.ghostFuzzRadiusMeters}
                    onChange={(e) => handleImmediateSettingChange("ghostFuzzRadiusMeters", parseInt(e.target.value))}
                    className="w-full accent-[#00F2FE] bg-white/10 h-1.5 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-white/40">{t.ghostFuzzDesc}</p>
                </div>

                {/* DM Permission */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <label className="text-xs font-semibold text-white/70">{t.dmPermission}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "EVERYONE", label: t.dmEveryone },
                      { id: "APPROVED", label: t.dmApproved },
                      { id: "NOBODY", label: t.dmNobody },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleImmediateSettingChange("allowDirectMessages", opt.id)}
                        className={`p-3 rounded-xl text-center text-xs border transition-all cursor-pointer ${
                          settingsForm.allowDirectMessages === opt.id
                            ? "bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE] font-bold"
                            : "bg-[#121212] border-white/10 text-white/60"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Toggle */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                  <div>
                    <div className="font-bold text-white">{t.showDistance}</div>
                    <div className="text-[10px] text-white/50">{t.showDistanceDesc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.showDistanceToOthers}
                    onChange={(e) => handleImmediateSettingChange("showDistanceToOthers", e.target.checked)}
                    className="w-4 h-4 accent-[#00F2FE] cursor-pointer"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Bell size={16} /> {t.notificationsSection}
                </h3>

                {[
                  { key: "notifications.pushEnabled", label: t.pushEnabled, val: settingsForm.notifications.pushEnabled },
                  { key: "notifications.nearbyUsersAlert", label: t.nearbyAlert, val: settingsForm.notifications.nearbyUsersAlert },
                  { key: "notifications.sparksAlert", label: t.sparksAlert, val: settingsForm.notifications.sparksAlert },
                  { key: "notifications.messagesAlert", label: t.messagesAlert, val: settingsForm.notifications.messagesAlert },
                  { key: "notifications.soundEnabled", label: t.soundEnabled, val: settingsForm.notifications.soundEnabled },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs text-white/70">
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => handleImmediateSettingChange(item.key, e.target.checked)}
                      className="w-4 h-4 accent-[#00F2FE] cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* App Preferences (Language & Units) */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Globe size={16} /> {t.appPreferences}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.language}</label>
                    <select
                      value={settingsForm.language}
                      onChange={(e) => handleImmediateSettingChange("language", e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs bg-[#121212] text-white border border-white/10"
                    >
                      <option value="cs">🇨🇿 Čeština</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="sk">🇸🇰 Slovenčina</option>
                      <option value="pl">🇵🇱 Polski</option>
                      <option value="uk">🇺🇦 Українська</option>
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="zh">🇨🇳 中文</option>
                      <option value="ja">🇯🇵 日本語</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.distanceUnit}</label>
                    <select
                      value={settingsForm.distanceUnit}
                      onChange={(e) => handleImmediateSettingChange("distanceUnit", e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs bg-[#121212] text-white border border-white/10"
                    >
                      <option value="metric">{t.metric}</option>
                      <option value="imperial">{t.imperial}</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ── 3. RIGHT SIDEBAR WIDGETS (Google+ Sparks & X Trends / Radar) ────────────── */}
      <aside className="w-80 h-screen sticky top-0 border-l border-white/10 p-5 hidden xl:flex flex-col gap-6 overflow-y-auto z-30 bg-[#0C0C0C]/50 backdrop-blur-md shrink-0">

        {/* Live Radar Widget */}
        <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Compass size={16} className="text-[#00F2FE]" /> Live Radar Status
            </span>
            <span className="text-[10px] font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#00F2FE]/30 animate-pulse">
              ACTIVE
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-white/70 font-semibold">
              <span>{t.radius}</span>
              <span className="text-[#00F2FE] font-bold">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-[#00F2FE] cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/60">Ghost Mode</span>
            <button
              type="button"
              onClick={() => handleImmediateSettingChange("privacyMode", isGhostMode ? "PUBLIC" : "GHOST")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                isGhostMode ? "bg-[#FF6B6B] text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {isGhostMode ? "👻 ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Trending Sparks Nearby (Google+ Sparks / X Trends) */}
        <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-[#FF6B6B]" /> Spontaneous Sparks
            </span>
            <button type="button" onClick={() => setActiveTab("sparks")} className="text-[10px] font-bold text-[#00F2FE] hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {sparks.slice(0, 3).map((s) => (
              <div key={s.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-[#00F2FE]/30 transition-all">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#00F2FE]">{s.category}</span>
                  <span className="text-white/40 font-mono">~{s.distanceMeters}m</span>
                </div>
                <div className="font-bold text-xs text-white truncate">{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Access Requests Pending Widget */}
        {incomingRequests.length > 0 && (
          <div className="glass-panel p-5 rounded-3xl space-y-3 border border-amber-400/30 bg-amber-400/[0.02]">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Lock size={15} /> Access Requests ({incomingRequests.length})
            </div>
            <p className="text-[11px] text-white/70">Nearby users requested to view your private profile.</p>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className="w-full py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:scale-[1.02] transition-all"
            >
              Review Requests
            </button>
          </div>
        )}

      </aside>

      {/* ── 4. CREATE SPARK MODAL ────────────────────────────────────────────────── */}
      {isCreateSparkOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl w-full max-w-md space-y-5 border border-[#00F2FE]/40 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Flame className="text-[#00F2FE]" size={18} /> {t.createSpark}
              </h3>
              <button type="button" onClick={() => setIsCreateSparkOpen(false)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              value={newSparkTitle}
              onChange={(e) => setNewSparkTitle(e.target.value)}
              placeholder="Meetup title (e.g. Coffee at Campus ☕)..."
              className="w-full glass-input px-4 py-3 rounded-2xl text-xs text-white placeholder-white/40"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">{t.category}</label>
              <div className="flex flex-wrap gap-2">
                {["COFFEE", "SPORTS", "PARTY", "STUDY"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewSparkCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      newSparkCategory === cat ? "bg-[#00F2FE] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateSparkOpen(false)} className="px-4 py-2 rounded-xl text-xs text-white/60 font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleCreateSpark} className="px-5 py-2 rounded-xl bg-[#00F2FE] text-black font-bold text-xs hover:scale-105 transition-all">
                Publish Spark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. STORY VIEWER MODAL ────────────────────────────────────────────────── */}
      {selectedStoryUser && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm h-[560px] bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="absolute top-3 left-3 right-3 h-1 bg-white/20 rounded-full z-20 overflow-hidden">
              <div style={{ width: `${storyProgress}%` }} className="h-full bg-white transition-all duration-100" />
            </div>

            <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <img src={selectedStoryUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#00F2FE]" />
                <span className="text-white text-xs font-bold">@{selectedStoryUser.username}</span>
              </div>
              <button type="button" onClick={() => setSelectedStoryUser(null)} className="text-white/70 hover:text-white text-sm font-bold">
                <X size={18} />
              </button>
            </div>

            <img
              src={selectedStoryUser.stories?.[0] || selectedStoryUser.avatarUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* ── 6. MOBILE BOTTOM NAVIGATION BAR (Phones) ───────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 flex items-center justify-around md:hidden shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        {[
          { id: "feed", label: t.radarTitle, icon: <Compass size={20} /> },
          { id: "sparks", label: t.sparksTitle, icon: <Flame size={20} /> },
          { id: "chats", label: t.chatsTitle, icon: <MessageSquare size={20} /> },
          { id: "requests", label: t.requestsTitle, icon: <Lock size={20} /> },
          { id: "settings", label: t.settingsTitle, icon: <Settings size={20} /> },
        ].map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as any)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-[#00F2FE]" : "text-white/50 hover:text-white"
              }`}
            >
              {icon}
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
