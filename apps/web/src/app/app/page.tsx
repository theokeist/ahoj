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
} from "lucide-react";
import { webApi } from "../../lib/api";
import { MOCK_NEARBY_USERS } from "../../lib/mockData";
import { TRANSLATIONS, type SupportedLanguage } from "@ahoj/shared";

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
    if (saved && TRANSLATIONS[saved]) {
      setLanguage(saved);
    }
    const handleLangChange = (e: any) => {
      if (e.detail && TRANSLATIONS[e.detail as SupportedLanguage]) {
        setLanguage(e.detail as SupportedLanguage);
      }
    };
    window.addEventListener("ahoj-lang-change", handleLangChange);
    return () => window.removeEventListener("ahoj-lang-change", handleLangChange);
  }, []);

  const t = TRANSLATIONS[language] ?? TRANSLATIONS.cs;

  // Auth Guard & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [myUser, setMyUser] = useState<any>(null);

  // Tab & Control States
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "requests" | "settings">("feed");
  const [radiusKm, setRadiusKm] = useState<number>(2);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");

  // Detailed Settings State
  const [settingsForm, setSettingsForm] = useState({
    username: "",
    bio: "",
    message: "",
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
    language: "cs" as SupportedLanguage,
    distanceUnit: "metric",
    autoPlayVideos: "wifi",
    mediaUploadQuality: "high",
  });
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState<boolean>(false);

  // Data States
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [sparks, setSparks] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Active Chat State
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);

  // Modals & Story Viewers
  const [selectedStoryUser, setSelectedStoryUser] = useState<any | null>(null);
  const [storyProgress, setStoryProgress] = useState<number>(0);
  const [isCreateSparkOpen, setIsCreateSparkOpen] = useState<boolean>(false);
  const [newSparkTitle, setNewSparkTitle] = useState<string>("");
  const [newSparkCategory, setNewSparkCategory] = useState<string>("COFFEE");

  // Story Creator Media Editor Modal
  const [isAddStoryOpen, setIsAddStoryOpen] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [addedStickers, setAddedStickers] = useState<string[]>([]);
  const [isUploadingStory, setIsUploadingStory] = useState<boolean>(false);

  // User GPS Location
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 49.1951, lng: 16.6068 });

  // Initial Auth & Settings Fetch
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthenticated(false);
      router.replace("/login");
      return;
    }

    webApi
      .getMe()
      .then((res) => {
        setMyUser(res.user);
        setIsGhostMode(res.user.privacyMode === "GHOST");
        setSettingsForm((prev) => ({
          ...prev,
          username: res.user.username || "",
          bio: res.user.bio || "",
          message: res.user.message || "",
          avatarUrl: res.user.profilePhotoUrl || res.user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user",
          privacyMode: res.user.privacyMode || "PUBLIC",
        }));
        setIsAuthenticated(true);

        // Fetch DB user settings
        return webApi.getSettings();
      })
      .then((settings) => {
        if (settings) {
          setSettingsForm((prev) => ({
            ...prev,
            privacyMode: settings.privacyMode ?? prev.privacyMode,
            ghostFuzzRadiusMeters: settings.ghostFuzzRadiusMeters ?? 300,
            allowDirectMessages: settings.allowDirectMessages ?? "EVERYONE",
            showDistanceToOthers: settings.showDistanceToOthers ?? true,
            notifications: settings.notifications ?? prev.notifications,
            language: settings.language ?? prev.language,
            distanceUnit: settings.distanceUnit ?? "metric",
            autoPlayVideos: settings.autoPlayVideos ?? "wifi",
            mediaUploadQuality: settings.mediaUploadQuality ?? "high",
          }));
          if (settings.language && TRANSLATIONS[settings.language as SupportedLanguage]) {
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
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}
      );
    }
  }, [router]);

  // Immediate Setting Save Handler
  const handleImmediateSettingChange = async (key: string, value: any) => {
    let updated: typeof settingsForm;
    if (key.startsWith("notifications.")) {
      const subKey = key.split(".")[1];
      updated = {
        ...settingsForm,
        notifications: {
          ...settingsForm.notifications,
          [subKey]: value,
        },
      };
    } else {
      updated = { ...settingsForm, [key]: value };
    }

    setSettingsForm(updated);

    if (key === "privacyMode") {
      setIsGhostMode(value === "GHOST");
    }

    if (key === "language") {
      setLanguage(value);
      localStorage.setItem("ahoj-lang", value);
      window.dispatchEvent(new CustomEvent("ahoj-lang-change", { detail: value }));
    }

    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 2000);

    try {
      if (key === "message") {
        await webApi.updateMessage(value);
      } else if (["username", "bio", "avatarUrl"].includes(key)) {
        await webApi.updateProfile({
          username: updated.username,
          bio: updated.bio,
          profilePhotoUrl: updated.avatarUrl,
          privacyMode: updated.privacyMode,
        });
      }

      await webApi.updateSettings({
        privacyMode: updated.privacyMode,
        ghostFuzzRadiusMeters: updated.ghostFuzzRadiusMeters,
        allowDirectMessages: updated.allowDirectMessages,
        showDistanceToOthers: updated.showDistanceToOthers,
        notifications: updated.notifications,
        language: updated.language,
        distanceUnit: updated.distanceUnit,
        autoPlayVideos: updated.autoPlayVideos,
        mediaUploadQuality: updated.mediaUploadQuality,
      });
    } catch {
      // Silent catch
    }
  };

  // Load Real Data from Fastify API
  const loadAppData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      const [nearbyRes, sparksRes, convsRes, reqsRes] = await Promise.allSettled([
        webApi.getNearbyUsers(coords.lat, coords.lng, radiusKm),
        webApi.getSparks(coords.lat, coords.lng, radiusKm),
        webApi.getConversations(),
        webApi.getIncomingRequests(),
      ]);

      if (nearbyRes.status === "fulfilled") {
        setNearbyUsers(nearbyRes.value?.users?.length ? nearbyRes.value.users : MOCK_NEARBY_USERS);
      } else {
        setNearbyUsers(MOCK_NEARBY_USERS);
      }

      if (sparksRes.status === "fulfilled") {
        setSparks(sparksRes.value?.sparks || []);
      }

      if (convsRes.status === "fulfilled") {
        setConversations(convsRes.value?.conversations || []);
      }

      if (reqsRes.status === "fulfilled") {
        setIncomingRequests(reqsRes.value?.requests || []);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAppData();
    }
  }, [isAuthenticated, coords, radiusKm]);

  // Connect Socket.io
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("accessToken") },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("location:update", coords);
    });

    socket.on("feed:update", (users: any[]) => {
      if (users?.length) setNearbyUsers(users);
    });

    socket.on("message:new", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, coords]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    router.replace("/login");
  };

  const handleCreateSpark = async () => {
    if (!newSparkTitle.trim()) return;
    try {
      await webApi.createSpark({
        title: newSparkTitle,
        category: newSparkCategory,
        lat: coords.lat,
        lng: coords.lng,
      });
      setNewSparkTitle("");
      setIsCreateSparkOpen(false);
      loadAppData();
    } catch {
      // Failed
    }
  };

  const handleUploadStory = async () => {
    setIsUploadingStory(true);
    try {
      await webApi.uploadStory("https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=600", `Vibe: ${selectedFilter}`);
      setIsAddStoryOpen(false);
      setSelectedFilter("none");
      setAddedStickers([]);
      loadAppData();
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeChatUser) return;
    const tempMsg = {
      id: String(Date.now()),
      senderId: myUser?.id,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await webApi.sendMessage(activeChatUser.id, text);
    } catch {
      // Saved
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="page-shell" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
          <RefreshCw style={{ width: 32, height: 32, color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loading ahoj Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>

      {/* AUTHENTICATED APP HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="content-max" style={{ padding: '0 var(--space-lg)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none' }}>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>/A\</span>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>ahoj</span>
            </Link>
            <span className="badge-brand" style={{ fontSize: 'var(--text-xs)' }}>
              <Zap style={{ width: 12, height: 12 }} /> {t.nav.dashboard}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              style={{
                padding: '8px var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: activeTab === 'settings' ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
                background: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'settings' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
                cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)',
                transition: 'all 0.15s ease',
              }}
              title={t.settings.title}
            >
              <Settings style={{ width: 14, height: 14 }} />
              <span>{t.settings.title}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '6px var(--space-sm)' }}>
              <img
                src={myUser?.avatarUrl || settingsForm.avatarUrl}
                alt="My profile"
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-primary)' }}
              />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>@{myUser?.username || settingsForm.username}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: 8,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title={t.nav.signOut}
            >
              <LogOut style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </header>

      <main className="content-max" style={{ flex: 1, width: '100%', padding: 'var(--space-lg)', display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)', position: 'relative', zIndex: 10 }}>

        {/* LEFT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-primary)', padding: 2, backgroundColor: 'var(--bg-card)' }}>
                <img
                  src={myUser?.avatarUrl || settingsForm.avatarUrl}
                  alt="My avatar"
                  style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--color-success)', border: '2px solid var(--bg-primary)' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', margin: 0 }}>@{myUser?.username || settingsForm.username}</h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield style={{ width: 12, height: 12 }} /> Proximity Verified
                </span>
              </div>
            </div>

            <div style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 10, color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'uppercase' }}>{t.settings.statusMessage}</span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontStyle: 'italic', margin: '2px 0 0' }}>&quot;{myUser?.message || settingsForm.message || "Ahoj!"}&quot;</p>
            </div>

            <div style={{ paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>{t.feed.radius}</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{radiusKm} km</span>
              </div>
              <input
                type="range" min="0.5" max="10" step="0.5" value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="glass-panel" style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'feed', label: t.feed.title, icon: <Compass style={{ width: 15, height: 15 }} />, count: (nearbyUsers || []).length },
              { id: 'sparks', label: t.sparks.title, icon: <Flame style={{ width: 15, height: 15 }} />, count: (sparks || []).length },
              { id: 'chats', label: t.chats.title, icon: <MessageSquare style={{ width: 15, height: 15 }} />, count: (conversations || []).length },
              { id: 'requests', label: t.requests.title, icon: <Lock style={{ width: 15, height: 15 }} />, count: incomingRequests?.length || 0 },
              { id: 'settings', label: t.settings.title, icon: <Settings style={{ width: 15, height: 15 }} />, count: null },
            ].map(({ id, label, icon, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as any)}
                style={{
                  width: '100%',
                  padding: '10px var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s ease',
                  background: activeTab === id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{icon} {label}</span>
                {count !== null && count > 0 && (
                  <span style={{
                    fontSize: 10, fontFamily: 'monospace',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: id === 'requests' ? 'var(--color-accent)' : 'rgba(0,0,0,0.3)',
                    color: id === 'requests' ? 'var(--bg-primary)' : 'inherit',
                  }}>{count}</span>
                )}
                {count === null && <ChevronRight style={{ width: 13, height: 13, opacity: 0.5 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CANVAS */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', minHeight: 650, position: 'relative' }}>

          {/* Control Bar */}
          <div style={{ height: 56, padding: '0 var(--space-lg)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 20 }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textTransform: 'capitalize' }}>
              {activeTab === 'feed' && <Compass style={{ width: 15, height: 15, color: 'var(--color-primary)' }} />}
              {activeTab === 'sparks' && <Flame style={{ width: 15, height: 15, color: 'var(--color-primary)' }} />}
              {activeTab === 'chats' && <MessageSquare style={{ width: 15, height: 15, color: 'var(--color-primary)' }} />}
              {activeTab === 'requests' && <Lock style={{ width: 15, height: 15, color: 'var(--color-primary)' }} />}
              {activeTab === 'settings' && <Settings style={{ width: 15, height: 15, color: 'var(--color-primary)' }} />}
              {activeTab === 'settings' ? t.settings.title : activeTab}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              {activeTab === 'feed' && (
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  {(['grid', 'radar'] as const).map((mode) => (
                    <button key={mode} type="button" onClick={() => setViewMode(mode)}
                      style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 4,
                        cursor: 'pointer', border: 'none',
                        background: viewMode === mode ? 'var(--color-primary)' : 'transparent',
                        color: viewMode === mode ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {mode === 'grid' ? <LayoutGrid style={{ width: 13, height: 13 }} /> : <Radio style={{ width: 13, height: 13 }} />}
                      {mode === 'grid' ? t.feed.grid : t.feed.radar}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleImmediateSettingChange("privacyMode", isGhostMode ? "PUBLIC" : "GHOST")}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isGhostMode ? '1px solid var(--color-accent)' : '1px solid var(--border-light)',
                  backgroundColor: isGhostMode ? 'rgba(255,107,107,0.15)' : 'var(--bg-card)',
                  color: isGhostMode ? 'var(--color-accent)' : 'var(--text-tertiary)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                title={isGhostMode ? t.settings.privacyGhost : "Toggle Ghost Mode"}
              >
                <Ghost style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* TAB 1: NEARBY RADAR FEED */}
          {activeTab === "feed" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {nearbyUsers.map((user) => (
                  <div key={user.id} className="glass-panel p-4 rounded-3xl space-y-3 border border-white/10 hover:border-[#00F2FE]/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl bg-white/5 border border-[#00F2FE]/40 overflow-hidden">
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        {user.hasActiveStories && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF6B6B] border border-black" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">@{user.username}</div>
                        <div className="text-xs text-[#00F2FE] font-mono font-semibold">~{user.distanceMeters}m {t.feed.distance}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#121212] border border-white/10 text-xs text-white/80 italic">
                      &quot;{user.message}&quot;
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-white/40 text-[10px]">{user.lastActive || "Active now"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChatUser(user);
                          setActiveTab("chats");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#00F2FE]/15 hover:bg-[#00F2FE]/25 text-[#00F2FE] font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPARKS MEETUPS */}
          {activeTab === "sparks" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-white/70">{t.sparks.title}</span>
                <button
                  type="button"
                  onClick={() => setIsCreateSparkOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00DCE6] text-[#0C0C0C] font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" /> {t.sparks.create}
                </button>
              </div>

              {isCreateSparkOpen && (
                <div className="p-4 rounded-3xl bg-[#121212] border border-[#00F2FE]/40 space-y-3 animate-fadeIn">
                  <div className="font-bold text-sm text-white">{t.sparks.create}</div>
                  <input
                    type="text"
                    value={newSparkTitle}
                    onChange={(e) => setNewSparkTitle(e.target.value)}
                    placeholder="Meetup title (e.g. Coffee at Campus ☕)..."
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  />
                  <div className="flex gap-2">
                    {["COFFEE", "SPORTS", "PARTY", "STUDY"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewSparkCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          newSparkCategory === cat ? "bg-[#00F2FE] text-[#0C0C0C]" : "bg-white/5 text-white/60"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsCreateSparkOpen(false)} className="px-3 py-1.5 rounded-xl text-xs text-white/60">Cancel</button>
                    <button type="button" onClick={handleCreateSpark} className="px-4 py-1.5 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs">Publish Spark</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sparks.map((spark) => (
                  <div key={spark.id} className="glass-panel p-4 rounded-3xl space-y-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-[#00F2FE]/15 text-[#00F2FE] font-bold px-2.5 py-0.5 rounded-full border border-[#00F2FE]/30">
                        {spark.category}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">~{spark.distanceMeters}m</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{spark.title}</h4>
                    <p className="text-xs text-white/60">{spark.description || "Spontaneous meetup created nearby."}</p>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/40 text-[10px]">@{spark.username}</span>
                      <button type="button" className="px-3 py-1.5 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs">{t.sparks.join}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: E2EE CHATS */}
          {activeTab === "chats" && (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r border-white/10 p-3 space-y-2 overflow-y-auto">
                <div className="text-xs font-bold text-white/60 uppercase tracking-wider px-2 py-1">{t.chats.title}</div>
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChatUser(c.partner)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all ${
                      activeChatUser?.id === c.partner.id ? "bg-[#00F2FE]/15 border-[#00F2FE]/40" : "bg-white/5 border-white/5"
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
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                      <div className="font-bold text-xs text-white">@{activeChatUser.username}</div>
                      <span className="text-[10px] text-[#4CAF50] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t.chats.e2eeNotice}
                      </span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.senderId === myUser?.id ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                            m.senderId === myUser?.id ? "bg-[#00F2FE] text-[#0C0C0C] font-semibold" : "bg-white/10 text-white"
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border-t border-white/10 flex gap-2">
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
                        placeholder={t.chats.typeMessage}
                        className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleSendMessage(typedMessage);
                          setTypedMessage("");
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs"
                      >
                        {t.chats.send}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
                    Select a conversation to start chat
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS REQUESTS */}
          {activeTab === "requests" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="text-xs font-bold text-white/70 uppercase tracking-wider">{t.requests.title}</div>
              {incomingRequests.length ? (
                incomingRequests.map((req) => (
                  <div key={req.id} className="glass-panel p-4 rounded-3xl flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-[#00F2FE]">
                        {req.requesterUsername?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">@{req.requesterUsername}</div>
                        <div className="text-[10px] text-white/40">Requested access to private profile & stories</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => webApi.approveAccess(req.id).then(loadAppData)} className="px-3.5 py-1.5 rounded-xl bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/40 font-bold text-xs">{t.requests.approve}</button>
                      <button type="button" onClick={() => webApi.denyAccess(req.id).then(loadAppData)} className="px-3.5 py-1.5 rounded-xl bg-[#F44336]/20 text-[#F44336] border border-[#F44336]/40 font-bold text-xs">{t.requests.deny}</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-white/40 text-xs font-medium space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-white/20" />
                  <p>{t.requests.noRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: APP SETTINGS PAGE (IMMEDIATE SAVE) */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-none">

              {settingsSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-[#4CAF50]/20 border border-[#4CAF50] text-[#4CAF50] text-xs font-bold flex items-center gap-2 animate-fadeIn sticky top-0 z-30 shadow-lg backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4" /> {t.settings.saved}
                </div>
              )}

              {/* Profile & Identity */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> {t.settings.profile}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.settings.username}</label>
                    <input
                      type="text"
                      value={settingsForm.username}
                      onChange={(e) => handleImmediateSettingChange("username", e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                      placeholder={t.settings.username}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.settings.statusMessage}</label>
                    <input
                      type="text"
                      value={settingsForm.message}
                      onChange={(e) => handleImmediateSettingChange("message", e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                      placeholder={t.settings.statusMessage}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">{t.settings.bio}</label>
                  <textarea
                    rows={2}
                    value={settingsForm.bio}
                    onChange={(e) => handleImmediateSettingChange("bio", e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                    placeholder={t.settings.bio}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">{t.settings.avatarUrl}</label>
                  <input
                    type="text"
                    value={settingsForm.avatarUrl}
                    onChange={(e) => handleImmediateSettingChange("avatarUrl", e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Privacy & Location Modes */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {t.settings.privacy}
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Proximity Visibility</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "PUBLIC", label: t.settings.privacyPublic, desc: t.settings.privacyPublicDesc },
                      { id: "GHOST", label: t.settings.privacyGhost, desc: t.settings.privacyGhostDesc },
                      { id: "PRIVATE", label: t.settings.privacyPrivate, desc: t.settings.privacyPrivateDesc },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleImmediateSettingChange("privacyMode", mode.id)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                          settingsForm.privacyMode === mode.id
                            ? "bg-[#00F2FE] text-[#0C0C0C] border-[#00F2FE] font-bold"
                            : "bg-[#121212] border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className="text-[10px] opacity-70">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ghost Fuzzing Radius */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-white/70">
                    <span>{t.settings.ghostFuzz}</span>
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
                  <p className="text-[10px] text-white/40">{t.settings.ghostFuzzDesc}</p>
                </div>

                {/* DM Permission */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-xs font-semibold text-white/70">{t.settings.dmPermission}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "EVERYONE", label: t.settings.dmEveryone },
                      { id: "APPROVED", label: t.settings.dmApproved },
                      { id: "NOBODY", label: t.settings.dmNobody },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleImmediateSettingChange("allowDirectMessages", opt.id)}
                        className={`p-2.5 rounded-xl text-center text-xs border transition-all cursor-pointer ${
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
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                  <div>
                    <div className="font-bold text-white">{t.settings.showDistance}</div>
                    <div className="text-[10px] text-white/50">{t.settings.showDistanceDesc}</div>
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
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4" /> {t.settings.notifications}
                </h3>

                {[
                  { key: "notifications.pushEnabled", label: t.settings.pushEnabled, val: settingsForm.notifications.pushEnabled },
                  { key: "notifications.nearbyUsersAlert", label: t.settings.nearbyAlert, val: settingsForm.notifications.nearbyUsersAlert },
                  { key: "notifications.sparksAlert", label: t.settings.sparksAlert, val: settingsForm.notifications.sparksAlert },
                  { key: "notifications.messagesAlert", label: t.settings.messagesAlert, val: settingsForm.notifications.messagesAlert },
                  { key: "notifications.soundEnabled", label: t.settings.soundEnabled, val: settingsForm.notifications.soundEnabled },
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
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> {t.settings.appPreferences}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">{t.settings.language}</label>
                    <select
                      value={settingsForm.language}
                      onChange={(e) => handleImmediateSettingChange("language", e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-[#121212] text-white border border-white/10"
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
                    <label className="text-xs font-semibold text-white/70">{t.settings.distanceUnit}</label>
                    <select
                      value={settingsForm.distanceUnit}
                      onChange={(e) => handleImmediateSettingChange("distanceUnit", e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-[#121212] text-white border border-white/10"
                    >
                      <option value="metric">{t.settings.metric}</option>
                      <option value="imperial">{t.settings.imperial}</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* STORY VIEWER MODAL */}
      {selectedStoryUser && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[550px] bg-black rounded-3xl overflow-hidden border border-white/20">
            <div className="absolute top-3 left-3 right-3 h-1 bg-white/20 rounded-full z-20 overflow-hidden">
              <div style={{ width: `${storyProgress}%` }} className="h-full bg-white transition-all duration-100" />
            </div>

            <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <img src={selectedStoryUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-white text-xs font-bold">@{selectedStoryUser.username}</span>
              </div>
              <button type="button" onClick={() => setSelectedStoryUser(null)} className="text-white text-sm font-bold cursor-pointer">✕</button>
            </div>

            <img
              src={selectedStoryUser.stories?.[0] || selectedStoryUser.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
              alt="Story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
