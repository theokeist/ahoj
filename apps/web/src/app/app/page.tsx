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

  // Auth Guard & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [myUser, setMyUser] = useState<any>(null);

  // Tab & Control States
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "requests" | "settings">("feed");
  const [radiusKm, setRadiusKm] = useState<number>(2);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    username: "",
    bio: "",
    message: "",
    avatarUrl: "",
    privacyMode: "PUBLIC",
    distanceUnit: "km",
    notificationsEnabled: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
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
  const [storyMediaUrl, setStoryMediaUrl] = useState<string>("https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600");
  const [storyCaption, setStoryCaption] = useState<string>("");
  const [storyFilter, setStoryFilter] = useState<string>("none");
  const [storySticker, setStorySticker] = useState<string | null>(null);

  // Location Coordinates (Default Brno)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 49.1951, lng: 16.6079 });

  // Check Authentication on Mount
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
        setSettingsForm({
          username: res.user.username || "",
          bio: res.user.bio || "",
          message: res.user.message || "",
          avatarUrl: res.user.profilePhotoUrl || res.user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user",
          privacyMode: res.user.privacyMode || "PUBLIC",
          distanceUnit: "km",
          notificationsEnabled: true,
        });
        setIsAuthenticated(true);
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
  }, [isAuthenticated, radiusKm, coords]);

  // Real-Time Socket.io Connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("accessToken");
    const socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("message:new", (msg: any) => {
      if (activeChatUser && msg.senderId === activeChatUser.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, activeChatUser]);

  // Story Progress Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedStoryUser) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setSelectedStoryUser(null);
            return 0;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [selectedStoryUser]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !activeChatUser) return;
    const text = typedMessage.trim();
    setTypedMessage("");

    const tempMsg = {
      id: Date.now().toString(),
      senderId: myUser?.id || "me",
      receiverId: activeChatUser.id,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await webApi.sendMessage(activeChatUser.id, text);
    } catch {
      // Message saved
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSaveSuccess(false);

    try {
      if (settingsForm.message !== myUser?.message) {
        await webApi.updateMessage(settingsForm.message);
      }

      const updatedUser = await webApi.updateProfile({
        username: settingsForm.username,
        bio: settingsForm.bio,
        privacyMode: settingsForm.privacyMode,
        profilePhotoUrl: settingsForm.avatarUrl,
      });

      setMyUser((prev: any) => ({
        ...prev,
        ...updatedUser,
        username: settingsForm.username,
        bio: settingsForm.bio,
        message: settingsForm.message,
        privacyMode: settingsForm.privacyMode,
        avatarUrl: settingsForm.avatarUrl,
      }));

      setIsGhostMode(settingsForm.privacyMode === "GHOST");
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch {
      setMyUser((prev: any) => ({
        ...prev,
        username: settingsForm.username,
        bio: settingsForm.bio,
        message: settingsForm.message,
        privacyMode: settingsForm.privacyMode,
        avatarUrl: settingsForm.avatarUrl,
      }));
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateSpark = async () => {
    if (!newSparkTitle.trim()) return;
    try {
      const res = await webApi.createSpark({
        title: newSparkTitle,
        category: newSparkCategory,
        lat: coords.lat,
        lng: coords.lng,
      });
      setSparks([res.spark, ...(sparks || [])]);
      setNewSparkTitle("");
      setIsCreateSparkOpen(false);
    } catch {
      const newSpark = {
        id: Date.now().toString(),
        username: myUser?.username || "dev_user",
        userAvatarUrl: myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user",
        title: newSparkTitle,
        category: newSparkCategory,
        distanceMeters: 50,
        createdAt: "Just now",
      };
      setSparks([newSpark, ...(sparks || [])]);
      setNewSparkTitle("");
      setIsCreateSparkOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setStoryMediaUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishStory = async () => {
    if (!storyMediaUrl.trim()) return;

    const params = new URLSearchParams();
    if (storyFilter !== "none") params.append("filter", storyFilter);
    if (storyCaption.trim()) params.append("text", storyCaption.trim());
    if (storySticker) params.append("sticker", storySticker);

    const queryString = params.toString();
    const finalUrl = queryString ? `${storyMediaUrl}?${queryString}` : storyMediaUrl;

    try {
      await webApi.uploadStory(finalUrl, storyCaption);
      setIsAddStoryOpen(false);
      setStoryCaption("");
      loadAppData();
    } catch {
      setIsAddStoryOpen(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await webApi.approveAccess(id);
      setIncomingRequests((incomingRequests || []).filter((r) => r.id !== id));
    } catch {
      setIncomingRequests((incomingRequests || []).filter((r) => r.id !== id));
    }
  };

  const handleDenyRequest = async (id: string) => {
    try {
      await webApi.denyAccess(id);
      setIncomingRequests((incomingRequests || []).filter((r) => r.id !== id));
    } catch {
      setIncomingRequests((incomingRequests || []).filter((r) => r.id !== id));
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

      {/* AUTHENTICATED APP HEADER — Mobile Volcanic Theme via CSS variables */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="content-max" style={{ padding: '0 var(--space-lg)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none' }}>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>/A\</span>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>ahoj</span>
            </Link>
            <span className="badge-brand" style={{ fontSize: 'var(--text-xs)' }}>
              <Zap style={{ width: 12, height: 12 }} /> Web App
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
              title="App Settings"
            >
              <Settings style={{ width: 14, height: 14 }} />
              <span>Settings</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '6px var(--space-sm)' }}>
              <img
                src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                alt="My profile"
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-primary)' }}
              />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>@{myUser?.username || "dev_user"}</span>
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
              title="Sign Out"
            >
              <LogOut style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </header>

      <main className="content-max" style={{ flex: 1, width: '100%', padding: 'var(--space-lg)', display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)', position: 'relative', zIndex: 10 }} >

        {/* LEFT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-primary)', padding: 2, backgroundColor: 'var(--bg-card)' }}>
                <img
                  src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                  alt="My avatar"
                  style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--color-success)', border: '2px solid var(--bg-primary)' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', margin: 0 }}>@{myUser?.username || "dev_user"}</h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield style={{ width: 12, height: 12 }} /> Proximity Verified
                </span>
              </div>
            </div>

            <div style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 10, color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontStyle: 'italic', margin: '2px 0 0' }}>&quot;{myUser?.message || "Ahoj! Exploring nearby spots 📍"}&quot;</p>
            </div>

            <div style={{ paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>Radar Radius</span>
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
              { id: 'feed', label: 'Nearby Radar', icon: <Compass style={{ width: 15, height: 15 }} />, count: (nearbyUsers || []).length },
              { id: 'sparks', label: 'Sparks Meetups', icon: <Flame style={{ width: 15, height: 15 }} />, count: (sparks || []).length },
              { id: 'chats', label: 'E2EE Messages', icon: <MessageSquare style={{ width: 15, height: 15 }} />, count: (conversations || []).length },
              { id: 'requests', label: 'Access Requests', icon: <Lock style={{ width: 15, height: 15 }} />, count: incomingRequests?.length || 0 },
              { id: 'settings', label: 'App Settings', icon: <Settings style={{ width: 15, height: 15 }} />, count: null },
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
              {activeTab === 'settings' ? 'App Settings & Profile' : activeTab}
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
                      {mode === 'grid' ? 'Grid' : 'Radar'}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsGhostMode(!isGhostMode)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isGhostMode ? '1px solid var(--color-accent)' : '1px solid var(--border-light)',
                  backgroundColor: isGhostMode ? 'rgba(255,107,107,0.15)' : 'var(--bg-card)',
                  color: isGhostMode ? 'var(--color-accent)' : 'var(--text-tertiary)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                title={isGhostMode ? 'Ghost Mode Active' : 'Toggle Ghost Mode'}
              >
                <Ghost style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* TAB 1: RADAR / PROXIMITY FEED */}
          {activeTab === "feed" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-none">
              
              {/* 24h Story Bar — Dual Story Ring Gradient (Mobile standard: #00F2FE -> #FF6B6B) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-white/70">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" /> 24h Active Stories</span>
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(true)}
                    className="text-[#00F2FE] hover:underline flex items-center gap-1 cursor-pointer font-semibold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post 24h Story
                  </button>
                </div>

                <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(true)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full p-[2px] story-ring-gradient relative bg-white/5 group-hover:scale-105 transition-transform">
                      <img
                        src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                        alt="My story"
                        className="w-full h-full rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00F2FE] text-[#0C0C0C] text-xs font-bold flex items-center justify-center">+</div>
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">Add Story</span>
                  </button>

                  {(nearbyUsers || []).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedStoryUser(user)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full p-[2px] story-ring-gradient bg-white/5 group-hover:scale-105 transition-transform">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-white/90 font-medium max-w-[56px] truncate">@{user.username}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Grid View vs Radar View */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(nearbyUsers || []).map((user) => (
                    <div
                      key={user.id}
                      className="glass-panel p-4 rounded-2xl space-y-3 relative group border border-white/10 hover:border-[#00F2FE]/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
                          alt={user.username}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-[#00F2FE] transition-colors"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white">@{user.username}</h4>
                          <span className="text-[10px] text-[#00F2FE] font-bold">
                            {user.distanceMeters ? `${user.distanceMeters}m away` : "Nearby"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                        &quot;{user.message || "Ahoj!"}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative w-full h-[480px] bg-[#0C0C0C] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.12)_0,transparent_70%)]" />
                  <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-radar pointer-events-none" />
                  <div className="absolute w-[300px] h-[300px] rounded-full border border-[#00F2FE]/30 animate-pulse pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-[#00F2FE]/20 border-2 border-[#00F2FE] flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-[#00F2FE]">You</span>
                  </div>

                  {(nearbyUsers || []).map((user, idx) => {
                    const angle = (idx / nearbyUsers.length) * 2 * Math.PI;
                    const dist = 90 + (idx % 3) * 55;
                    const x = Math.cos(angle) * dist;
                    const y = Math.sin(angle) * dist;

                    return (
                      <div
                        key={user.id}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        className="absolute z-20 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setSelectedStoryUser(user)}
                      >
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
                          alt={user.username}
                          className="w-11 h-11 rounded-full border-2 border-[#00F2FE] object-cover"
                        />
                        <span className="text-[9px] bg-black/80 text-white font-bold px-2 py-0.5 rounded-full border border-white/20">
                          @{user.username}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SPARKS MEETUPS */}
          {activeTab === "sparks" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#00F2FE]" /> Spontaneous Meetups (2h Expiry)
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreateSparkOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#00F2FE] hover:bg-[#00DCE6] text-[#0C0C0C] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Spark
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(sparks || []).map((spark) => (
                  <div key={spark.id} className="glass-panel p-4 rounded-2xl space-y-2 border border-[#00F2FE]/30 hover:border-[#00F2FE] transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30">
                        {spark.category}
                      </span>
                      <span className="text-[10px] text-white/50 font-medium">2h active</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{spark.title}</h4>
                    <span className="text-xs text-white/60">By @{spark.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: E2EE CHATS */}
          {activeTab === "chats" && (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r border-white/10 overflow-y-auto p-3 space-y-2 scrollbar-none">
                {(conversations || []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChatUser(c)}
                    className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer ${
                      activeChatUser?.id === c.id ? "bg-white/10 border border-[#00F2FE]/50" : "hover:bg-white/5"
                    }`}
                  >
                    <img src={c.avatarUrl} alt={c.username} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate">@{c.username}</h4>
                      <p className="text-[10px] text-[#00F2FE] font-medium truncate flex items-center gap-1">
                        <Shield className="w-3 h-3 inline" /> Signal E2EE
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="w-2/3 flex flex-col bg-black/40">
                {activeChatUser ? (
                  <>
                    <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/5">
                      <span className="font-bold text-xs text-white">@{activeChatUser.username}</span>
                      <span className="text-[10px] text-[#4CAF50] font-semibold flex items-center gap-1 bg-[#4CAF50]/15 px-2.5 py-0.5 rounded-full border border-[#4CAF50]/30">
                        <Shield className="w-3 h-3" /> Signal E2EE Active
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {(messages || []).map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${m.senderId === myUser?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-xs font-medium ${
                              m.senderId === myUser?.id
                                ? "bg-[#00F2FE] text-[#0C0C0C] font-semibold"
                                : "bg-white/10 text-white border border-white/10"
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-white/10 flex gap-2">
                      <input
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type E2EE message..."
                        className="flex-1 glass-input px-4 py-2 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="px-4 py-2 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs cursor-pointer hover:bg-[#00DCE6] transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs">
                    <MessageSquare className="w-8 h-8 mb-2 text-white/20" /> Select a chat to start messaging
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS REQUESTS */}
          {activeTab === "requests" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <span className="text-xs font-bold text-white/70">Pending Story & Profile Access Requests</span>
              {(incomingRequests || []).length > 0 ? (
                incomingRequests.map((req) => (
                  <div key={req.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/10 hover:border-white/20 transition-all">
                    <div>
                      <h4 className="font-bold text-sm text-white">@{req.requesterUsername}</h4>
                      <span className="text-xs text-white/50">Wants to unlock your 24h stories</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#4CAF50] text-[#0C0C0C] font-bold text-xs cursor-pointer transition-all"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDenyRequest(req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-all"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-white/40 text-xs font-medium space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-white/20" />
                  <p>No pending access requests</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: APP SETTINGS PAGE */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-none">
              
              {settingsSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-[#4CAF50]/20 border border-[#4CAF50] text-[#4CAF50] text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
                </div>
              )}

              {/* Profile Customization Section */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile & Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Username</label>
                    <input
                      type="text"
                      value={settingsForm.username}
                      onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                      placeholder="Username..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Status Message (Visible on Radar)</label>
                    <input
                      type="text"
                      value={settingsForm.message}
                      onChange={(e) => setSettingsForm({ ...settingsForm, message: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                      placeholder="Status message..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Bio Description</label>
                  <textarea
                    rows={2}
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                    placeholder="Short bio about yourself..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Avatar Image URL</label>
                  <input
                    type="text"
                    value={settingsForm.avatarUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, avatarUrl: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Privacy & Radar Controls */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Privacy & Location Modes
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70">Proximity Visibility</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "PUBLIC", label: "Public 🌍", desc: "Visible on Radar" },
                      { id: "GHOST", label: "Ghost 👻", desc: "Invisible Mode" },
                      { id: "PRIVATE", label: "Private 🔒", desc: "Approval Required" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, privacyMode: mode.id })}
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

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                  <span>EXIF Privacy Protection</span>
                  <span className="text-[#4CAF50] font-bold flex items-center gap-1 bg-[#4CAF50]/15 px-2.5 py-0.5 rounded-full border border-[#4CAF50]/30">
                    <CheckCircle2 className="w-3 h-3" /> GPS Cleared
                  </span>
                </div>
              </div>

              {/* Encryption & Security Preferences */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
                <h3 className="font-bold text-sm text-[#00F2FE] uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4" /> Security & E2EE Signal Keys
                </h3>

                <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-[#121212] border border-white/10">
                  <div>
                    <div className="font-bold text-white">Signal E2EE Double Ratchet</div>
                    <div className="text-[10px] text-white/50">End-to-End Encrypted key exchange enabled</div>
                  </div>
                  <span className="text-[10px] bg-[#4CAF50]/20 text-[#4CAF50] font-bold px-2.5 py-0.5 rounded-full border border-[#4CAF50]/40">
                    Active
                  </span>
                </div>
              </div>

              {/* Save Actions */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-2xl bg-[#00F2FE] hover:bg-[#00DCE6] text-[#0C0C0C] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isSavingSettings ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Profile Settings
                </button>
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

      {/* WEB STORY CREATOR MEDIA EDITOR MODAL */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl space-y-4 border border-white/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00F2FE]" /> Story Media Editor
              </h3>
              <button type="button" onClick={() => setIsAddStoryOpen(false)} className="text-white/60 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            {/* Preview Box with Filter Tint & EXIF Badge */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
              <img src={storyMediaUrl} alt="Story preview" className="w-full h-full object-cover" />
              
              {/* Filter Tint Overlays */}
              {storyFilter === "beauty" && <div className="absolute inset-0 bg-[#FFDCE6]/15 pointer-events-none" />}
              {storyFilter === "bokeh" && <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none" />}
              {storyFilter === "greenscreen" && <div className="absolute inset-0 bg-[#4CAF50]/20 pointer-events-none" />}
              {storyFilter === "cyber" && <div className="absolute inset-0 bg-[#00F2FE]/20 pointer-events-none" />}
              {storyFilter === "retro" && <div className="absolute inset-0 bg-[#FF9800]/15 pointer-events-none" />}
              {storyFilter === "neon" && <div className="absolute inset-0 bg-[#FF6B6B]/20 pointer-events-none" />}
              {storyFilter === "noir" && <div className="absolute inset-0 bg-black/50 grayscale pointer-events-none" />}

              {/* Floating Sticker */}
              {storySticker && (
                <div className="absolute top-4 bg-[#00F2FE]/20 border border-[#00F2FE] px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                  {storySticker}
                </div>
              )}

              {/* Floating Caption */}
              {storyCaption && (
                <div className="absolute bottom-4 bg-black/70 border border-white/20 px-4 py-1.5 rounded-xl text-xs font-bold text-white text-center max-w-[80%]">
                  {storyCaption}
                </div>
              )}

              {/* EXIF Security Badge */}
              <div className="absolute top-3 left-3 bg-[#4CAF50]/20 border border-[#4CAF50] px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#4CAF50] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> EXIF Clean (GPS Privacy)
              </div>
            </div>

            {/* Inputs & File Upload */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storyMediaUrl}
                  onChange={(e) => setStoryMediaUrl(e.target.value)}
                  placeholder="Image URL or upload below..."
                  className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs"
                />
                <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer flex items-center gap-1 border border-white/10">
                  <ImageIcon className="w-3.5 h-3.5" /> Upload File
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <input
                type="text"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                placeholder="Story caption text..."
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />

              {/* Filter Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00F2FE] uppercase tracking-wider">Effects & Filters</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {STORY_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStoryFilter(f.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 border transition-all cursor-pointer ${
                        storyFilter === f.id ? "bg-[#00F2FE] text-[#0C0C0C] border-[#00F2FE] font-bold" : "bg-white/5 border-white/10 text-white/70"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticker Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00F2FE] uppercase tracking-wider">Stickers & Overlays</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setStorySticker(null)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 border cursor-pointer ${
                      !storySticker ? "bg-[#00F2FE] text-[#0C0C0C] border-[#00F2FE]" : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    ✕ None
                  </button>
                  {EMOJI_STICKERS.map((stk) => (
                    <button
                      key={stk}
                      type="button"
                      onClick={() => setStorySticker(stk)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 border cursor-pointer ${
                        storySticker === stk ? "bg-[#00F2FE] text-[#0C0C0C] border-[#00F2FE]" : "bg-white/5 border-white/10 text-white/70"
                      }`}
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePublishStory}
              className="w-full py-3 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs cursor-pointer"
            >
              Publish to 24h Stories ⚡
            </button>
          </div>
        </div>
      )}

      {/* CREATE SPARK MODAL */}
      {isCreateSparkOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4 border border-white/20">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">⚡ Create Nearby Spark</h3>
              <button type="button" onClick={() => setIsCreateSparkOpen(false)} className="text-white/60 hover:text-white cursor-pointer">✕</button>
            </div>
            <input
              type="text"
              value={newSparkTitle}
              onChange={(e) => setNewSparkTitle(e.target.value)}
              placeholder="What are you up to? (e.g. Coffee @ Main Square)"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
            />
            <button
              type="button"
              onClick={handleCreateSpark}
              className="w-full py-3 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs cursor-pointer"
            >
              Publish Spark (2h Expiry)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
