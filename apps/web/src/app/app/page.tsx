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
import { UserProfileSplitter } from "../../components/UserProfileSplitter";

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

const SYSTEM_NOTIFICATION_BOT = {
  id: "ahoj-notifications",
  username: "Ahoj Notifications 🔔",
  isSystem: true,
  avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
};

const INITIAL_INAPP_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "New Proximity Story 📸",
    body: "@natalie_s (~120m away) posted a new story: 'Hledám parťáka na turistiku 🏔️'",
    timestamp: "2m ago",
    category: "STORY",
    unread: true,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    targetUserIndex: 0,
    actions: [
      { id: "v-story", label: "View Story 📸", type: "VIEW_STORY", variant: "primary" },
      { id: "v-prof", label: "View Profile (Splitter)", type: "VIEW_PROFILE", variant: "secondary" },
    ],
  },
  {
    id: "notif-2",
    title: "Spontaneous Spark Meetup ⚡",
    body: "@kubajz created a Spark ~45m away: 'Specialty Coffee & Tech Chat ☕' at Skog Urban Hub.",
    timestamp: "15m ago",
    category: "SPARK",
    unread: true,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150",
    targetUserIndex: 1,
    actions: [
      { id: "j-spark", label: "Join Spark ⚡", type: "JOIN_SPARK", variant: "primary" },
      { id: "v-prof-2", label: "View Profile (Splitter)", type: "VIEW_PROFILE", variant: "secondary" },
    ],
  },
  {
    id: "notif-3",
    title: "Private Profile Access Request 🔒",
    body: "@secret_vibe requested access to view your stories and private profile details.",
    timestamp: "45m ago",
    category: "REQUEST",
    unread: true,
    requestStatus: "PENDING",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    targetUserIndex: 2,
    actions: [
      { id: "app-req", label: "Approve Access ✓", type: "APPROVE_REQUEST", variant: "success" },
      { id: "deny-req", label: "Deny ✕", type: "DENY_REQUEST", variant: "danger" },
    ],
  },
  {
    id: "notif-4",
    title: "Google+ +1 Endorsement 🎉",
    body: "@emma_art and 5 nearby users +1'd your status message: 'Ahoj Brno!'",
    timestamp: "1h ago",
    category: "PLUS_ONE",
    unread: false,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    targetUserIndex: 3,
    actions: [
      { id: "my-prof", label: "View My Profile (Splitter)", type: "MY_PROFILE", variant: "primary" },
    ],
  },
  {
    id: "notif-5",
    title: "Proximity Radar Update 📡",
    body: "4 active users found in your 3km radius around Brno Center.",
    timestamp: "2h ago",
    category: "PROXIMITY",
    unread: false,
    actions: [
      { id: "open-rad", label: "Open Live Radar 📡", type: "OPEN_RADAR", variant: "primary" },
    ],
  },
  {
    id: "notif-6",
    title: "Ghost Mode Security Guard 👻",
    body: "Location fuzzing is set to 300m. Your exact location is hidden while keeping nearby discovery active.",
    timestamp: "4h ago",
    category: "SYSTEM",
    unread: false,
    actions: [
      { id: "open-set", label: "Privacy Settings ⚙️", type: "OPEN_SETTINGS", variant: "secondary" },
    ],
  },
];

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
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "requests" | "profile" | "settings">("feed");
  const [selectedProfileUser, setSelectedProfileUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");
  const [radiusKm, setRadiusKm] = useState<number>(3);

  // In-App Notification System State
  const [inAppNotifications, setInAppNotifications] = useState<any[]>(INITIAL_INAPP_NOTIFICATIONS);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Data collections
  const [nearbyUsers, setNearbyUsers] = useState<any[]>(MOCK_NEARBY_USERS);
  const [sparks, setSparks] = useState<any[]>([
    { id: "s1", username: "tomas_p", category: "SPORTS", title: "Spontaneous 3v3 Basketball 🏀", distanceMeters: 450, description: "Looking for 2 players at Kravi Hora courts!" },
    { id: "s2", username: "karolina_v", category: "COFFEE", title: "Specialty Coffee & Chat ☕", distanceMeters: 320, description: "Working at Skog Urban Hub for 2 hours." },
    { id: "s3", username: "ondrej_f", category: "PARTY", title: "Impromptu Acoustic Jam 🎸", distanceMeters: 880, description: "Bring your guitar or synth!" },
  ]);
  const [conversations, setConversations] = useState<any[]>([
    {
      id: "conv-notifications",
      partner: SYSTEM_NOTIFICATION_BOT,
      lastMessage: "6 system & proximity notifications",
      unreadCount: 3,
      isSystem: true,
    },
    {
      id: "conv-natalie",
      partner: MOCK_NEARBY_USERS[0],
      lastMessage: "Ahoj! Zrovna balím batoh na víkend...",
      unreadCount: 0,
    },
    {
      id: "conv-kubajz",
      partner: MOCK_NEARBY_USERS[1],
      lastMessage: "Espresso je základ! Kdy máš čas?",
      unreadCount: 1,
    },
  ]);
  const [activeChatUser, setActiveChatUser] = useState<any>(SYSTEM_NOTIFICATION_BOT);
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

  // Notification Action Router Handler
  const handleNotificationAction = (notifId: string, actionType: string, targetUserIndex?: number) => {
    const targetUser = targetUserIndex !== undefined ? nearbyUsers[targetUserIndex] : null;

    switch (actionType) {
      case "VIEW_STORY":
        if (targetUser) setSelectedStoryUser(targetUser);
        break;
      case "VIEW_PROFILE":
        if (targetUser) setSelectedProfileUser(targetUser);
        break;
      case "MY_PROFILE":
        setActiveTab("profile");
        break;
      case "OPEN_RADAR":
        setActiveTab("feed");
        break;
      case "OPEN_SETTINGS":
        setActiveTab("settings");
        break;
      case "JOIN_SPARK":
        setNotificationToast("Joined Spark! Meeting at Skog Urban Hub ☕");
        setTimeout(() => setNotificationToast(null), 3500);
        break;
      case "APPROVE_REQUEST":
        setInAppNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, requestStatus: "APPROVED" } : n))
        );
        setNotificationToast("Approved access request!");
        setTimeout(() => setNotificationToast(null), 3500);
        break;
      case "DENY_REQUEST":
        setInAppNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, requestStatus: "DENIED" } : n))
        );
        setNotificationToast("Denied access request.");
        setTimeout(() => setNotificationToast(null), 3500);
        break;
    }
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
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: myUser?.id || "me",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setTypedMessage("");

    // Simulated live auto-reply for demo sandbox chat accounts
    if (!activeChatUser.isSystem && !activeChatUser.isOwnProfileSpace) {
      setTimeout(() => {
        const demoReplies = [
          "Ahoj! Super message. Let's grab coffee at Monogram soon! ☕",
          "Sounds great! I'm nearby Brno center right now. ⚡",
          "Awesome! Check out my profile splitter for more details. 🎨",
          "Yo! Let's connect on Ahoj radar meetup! 🏀",
        ];
        const randomReply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            senderId: activeChatUser.id,
            content: `⚡ @${activeChatUser.username}: ${randomReply}`,
          },
        ]);
      }, 1000);
    }
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
              onClick={() => setActiveTab("profile")}
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
              { id: "profile", label: "My Profile", icon: <User size={20} />, count: null },
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
              {activeTab === "profile" && "My Profile (Splitter)"}
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
            <div className={`p-4 md:p-6 space-y-6 ${viewMode === "radar" ? "w-full" : "max-w-4xl mx-auto"}`}>
              
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

              {/* ── Conditional View Mode: Radar View ("Kruh radaru" Full Map-like Viewport) vs Grid Cards ── */}
              {viewMode === "radar" ? (
                <div className="w-full min-h-[580px] h-[calc(100vh-220px)] rounded-3xl border border-white/15 bg-[#090909] relative overflow-hidden flex items-center justify-center shadow-2xl">
                  {/* Map Grid Pattern Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

                  {/* Floating Map Control Bar (Top Left) */}
                  <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-ping" />
                    <span className="font-bold flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#00F2FE]" /> Live Radar Map (Brno)
                    </span>
                    <span className="text-[10px] font-mono text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#00F2FE]/30">
                      {radiusKm} km · {nearbyUsers.length} Users
                    </span>
                  </div>

                  {/* Floating Map Category Filters (Top Right) */}
                  <div className="absolute top-4 right-4 z-30 hidden sm:flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
                    {["All", "☕ Coffee", "🏀 Sports", "💻 Tech", "🎧 Music"].map((cat, i) => (
                      <button
                        key={cat}
                        type="button"
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          i === 0 ? "bg-[#00F2FE] text-black" : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Floating Map Zoom & Action Controls (Bottom Right) */}
                  <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => alert("Zooming in on radar map...")}
                      className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md text-white border border-white/15 font-black text-sm flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Zooming out on radar map...")}
                      className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md text-white border border-white/15 font-black text-sm flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
                      title="Zoom Out"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Recentered on your location")}
                      className="w-9 h-9 rounded-xl bg-[#00F2FE] text-black font-bold text-xs flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)] hover:scale-105 transition-all"
                      title="Recenter"
                    >
                      🎯
                    </button>
                  </div>

                  {/* Floating Legend / Quick Hint (Bottom Left) */}
                  <div className="absolute bottom-4 left-4 z-30 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[11px] text-white/60 font-medium hidden sm:block">
                    Click any avatar blip to open full Profile Splitter
                  </div>

                  {/* Full-Size Interactive Circular Radar Field */}
                  <div className="relative w-[92%] max-w-[620px] aspect-square rounded-full border border-[#00F2FE]/25 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.12)_0,transparent_75%)] shadow-[0_0_80px_rgba(0,242,254,0.15)] overflow-hidden">
                    {/* Concentric Distance Circles */}
                    <div className="absolute inset-0 rounded-full border border-[#00F2FE]/15 pointer-events-none" />
                    <div className="absolute w-4/5 h-4/5 rounded-full border border-[#00F2FE]/25 pointer-events-none flex items-start justify-center">
                      <span className="text-[10px] font-mono font-bold text-[#00F2FE]/70 mt-2 bg-black/60 px-2 py-0.5 rounded-full border border-[#00F2FE]/30">500m</span>
                    </div>
                    <div className="absolute w-3/5 h-3/5 rounded-full border border-[#00F2FE]/35 pointer-events-none flex items-start justify-center">
                      <span className="text-[10px] font-mono font-bold text-[#00F2FE]/80 mt-2 bg-black/60 px-2 py-0.5 rounded-full border border-[#00F2FE]/30">250m</span>
                    </div>
                    <div className="absolute w-2/5 h-2/5 rounded-full border border-[#00F2FE]/45 pointer-events-none flex items-start justify-center">
                      <span className="text-[10px] font-mono font-bold text-[#00F2FE] mt-2 bg-black/60 px-2 py-0.5 rounded-full border border-[#00F2FE]/30">100m</span>
                    </div>
                    <div className="absolute w-1/5 h-1/5 rounded-full border border-[#00F2FE]/60 pointer-events-none" />

                    {/* Axis Crosshairs */}
                    <div className="absolute inset-x-0 top-1/2 h-px bg-[#00F2FE]/25 pointer-events-none" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-[#00F2FE]/25 pointer-events-none" />

                    {/* Animated 360 Sweep Beam */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none animate-spin"
                      style={{
                        animationDuration: "5s",
                        background: "conic-gradient(from 0deg, rgba(0,242,254,0.3) 0deg, transparent 55deg, transparent 360deg)",
                      }}
                    />

                    {/* Center Node (You / Self Location) */}
                    <div
                      onClick={() => setActiveTab("profile")}
                      className="relative z-20 w-12 h-12 rounded-full bg-[#00F2FE] text-black font-black text-xs flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,242,254,0.9)] cursor-pointer hover:scale-110 transition-transform"
                      title="Your Location (Click for Profile)"
                    >
                      <span className="leading-none text-sm">/A\</span>
                      <span className="text-[8px] font-extrabold uppercase">You</span>
                    </div>

                    {/* Positioned Nearby User Blips across Map Field */}
                    {nearbyUsers.map((u, idx) => {
                      const angles = [45, 135, 210, 315, 75, 260];
                      const distancesPx = [180, 220, 240, 140, 210, 190];
                      const angle = angles[idx % angles.length];
                      const dist = distancesPx[idx % distancesPx.length];
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * dist;
                      const y = Math.sin(rad) * dist;

                      return (
                        <div
                          key={u.id}
                          onClick={() => setSelectedProfileUser(u)}
                          className="absolute z-30 group cursor-pointer transition-all hover:scale-125"
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          title={`@${u.username} (${u.distanceMeters}m)`}
                        >
                          <div className="relative">
                            <img
                              src={u.avatarUrl}
                              alt={u.username}
                              className="w-10 h-10 rounded-full object-cover border-2 border-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.7)]"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00F2FE] border-2 border-[#090909]" />
                          </div>

                          {/* Map User Label Pill */}
                          <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#00F2FE]/40 text-[10px] font-bold text-white whitespace-nowrap shadow-lg flex items-center gap-1">
                            <span className="text-[#00F2FE]">@{u.username}</span>
                            <span className="text-white/50 text-[9px]">~{u.distanceMeters}m</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Multi-Card Stream (Distinct Modern Radar User Cards) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {nearbyUsers.map((user) => {
                    const pOne = plusOneState[user.id] || { count: 14, clicked: false };

                    return (
                      <article
                        key={user.id}
                        className="p-5 rounded-3xl bg-[#121212] border border-white/10 hover:border-[#00F2FE]/50 transition-all flex flex-col justify-between shadow-xl hover:shadow-[0_0_25px_rgba(0,242,254,0.18)] group relative overflow-hidden"
                      >
                        {/* Distinct Top Accent Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00F2FE]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="space-y-3.5">
                          {/* User Header Row */}
                          <div className="flex items-center justify-between">
                            <div
                              onClick={() => setSelectedProfileUser(user)}
                              className="flex items-center gap-3 cursor-pointer group/user"
                              title="View Profile (Splitter)"
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={user.avatarUrl}
                                  alt={user.username}
                                  className="w-12 h-12 rounded-2xl object-cover border border-white/15 group-hover/user:border-[#00F2FE] group-hover/user:scale-105 transition-all"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00F2FE] border-2 border-[#121212]" />
                              </div>

                              <div className="min-w-0">
                                <div className="font-extrabold text-sm text-white flex items-center gap-1.5 group-hover/user:text-[#00F2FE] transition-colors">
                                  @{user.username}
                                  <span className="text-[#00F2FE] text-[10px] font-bold">✓ Nearby</span>
                                  {user.privacyMode === "PRIVATE" && <Lock size={11} className="text-amber-400" />}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-white/60 font-medium">
                                  <span className="text-[#00F2FE] font-bold flex items-center gap-1">
                                    <MapPin size={11} /> ~{user.distanceMeters}m away
                                  </span>
                                  <span>·</span>
                                  <span className="text-white/40">{user.lastActive || "2m ago"}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedProfileUser(user)}
                              className="px-3 py-1.5 rounded-xl bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Profile 👤
                            </button>
                          </div>

                          {/* Distinct Icebreaker Quote Box */}
                          <div className="bg-white/[0.03] p-3.5 rounded-2xl border-l-2 border-l-[#00F2FE] border border-white/5 space-y-2">
                            <p className="text-xs text-white/90 italic font-medium leading-relaxed">
                              &ldquo;{user.message}&rdquo;
                            </p>

                            {/* Story Thumbnail Attachment */}
                            {user.stories && user.stories.length > 0 && (
                              <div
                                onClick={() => setSelectedProfileUser(user)}
                                className="relative mt-2 rounded-xl overflow-hidden border border-white/10 group/img cursor-pointer"
                              >
                                <img
                                  src={user.stories[0]}
                                  alt="Post attachment"
                                  className="w-full h-32 object-cover group-hover/img:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/20">
                                  📷 Story Moment
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Distinct Social Action Toolbar */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {/* +1 Endorse Button */}
                            <button
                              type="button"
                              onClick={() => handleTogglePlusOne(user.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                pOne.clicked
                                  ? "bg-[#00F2FE] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)] scale-105"
                                  : "bg-white/5 text-[#00F2FE] border border-white/10 hover:bg-[#00F2FE]/15"
                              }`}
                            >
                              <span>+1</span>
                              <span className="font-mono text-[11px]">{pOne.count}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => alert("Share user profile link")}
                              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors text-xs"
                              title="Share"
                            >
                              <Share2 size={13} />
                            </button>
                          </div>

                          {/* Direct Message Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveChatUser(user);
                              setActiveTab("chats");
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.25)] transition-all cursor-pointer"
                          >
                            <MessageSquare size={13} /> {t.chatBtn}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
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

          {/* TAB 3: FULL MODERN MESSENGER (CHATS & NOTIFICATIONS & MY PROFILE) */}
          {activeTab === "chats" && (
            <div className="h-[calc(100vh-65px)] flex bg-[#090909]">
              {/* ── Messenger Left Sidebar ───────────────────────────────────── */}
              <div className="w-72 sm:w-80 border-r border-white/10 p-3 space-y-3 overflow-y-auto flex flex-col bg-[#0C0C0C]">
                {/* Messenger Header & Search */}
                <div className="space-y-2 px-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#00F2FE]" /> Messenger
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#00F2FE]/30">
                      E2EE Active
                    </span>
                  </div>

                  {/* Messenger Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search messages & circles..."
                      className="w-full glass-input pl-8 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-white/40"
                    />
                    <Search size={13} className="absolute left-2.5 top-2.5 text-white/40" />
                  </div>

                  {/* Demo Accounts Quick Sandbox Switcher */}
                  <div className="bg-white/[0.03] p-2 rounded-2xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#00F2FE]">
                      <span className="flex items-center gap-1">⚡ Demo Sandbox Accounts</span>
                      <span className="text-white/40 font-normal">Click to chat</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                      {nearbyUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setActiveChatUser(u);
                            setMessages([
                              { id: `msg-1-${u.id}`, senderId: u.id, content: `Ahoj! &ldquo;${u.message}&rdquo;` },
                              { id: `msg-2-${u.id}`, senderId: myUser?.id || "me", content: "Ahoj! Great to connect nearby on Ahoj." },
                            ]);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                            activeChatUser?.id === u.id
                              ? "bg-[#00F2FE] text-black shadow-[0_0_10px_rgba(0,242,254,0.4)] font-extrabold"
                              : "bg-white/5 text-white/70 hover:text-white border border-white/10"
                          }`}
                        >
                          <img src={u.avatarUrl} alt={u.username} className="w-4 h-4 rounded-full object-cover" />
                          <span>@{u.username}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                  {/* System & Notification Channel */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveChatUser({
                        id: "ahoj-notifications",
                        username: "Ahoj Notifications 🔔",
                        isSystem: true,
                      } as any)
                    }
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      activeChatUser?.id === "ahoj-notifications"
                        ? "bg-[#00F2FE]/15 border-[#00F2FE]/40"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00F2FE] to-purple-600 p-0.5 shrink-0 shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                        <div className="w-full h-full rounded-[14px] bg-[#0C0C0C] flex items-center justify-center text-[#00F2FE] font-black text-xs">
                          /A\
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white flex items-center gap-1">
                          System & Alerts <Sparkles size={11} className="text-[#00F2FE]" />
                        </div>
                        <div className="text-[10px] text-white/50 truncate">Proximity updates & alerts</div>
                      </div>
                    </div>

                    {inAppNotifications.filter((n) => n.unread).length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#00F2FE] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                        {inAppNotifications.filter((n) => n.unread).length}
                      </span>
                    )}
                  </button>

                  {/* My Profile Channel */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveChatUser({
                        id: "my-own-profile",
                        username: `@${myUser?.username || "alex"} (My Profile)`,
                        isOwnProfileSpace: true,
                      } as any)
                    }
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      activeChatUser?.isOwnProfileSpace
                        ? "bg-[#00F2FE]/15 border-[#00F2FE]/40"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={myUser?.avatarUrl || settingsForm.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                        alt="My Avatar"
                        className="w-9 h-9 rounded-2xl object-cover border border-[#00F2FE]/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white flex items-center gap-1">
                          My Profile 👤
                        </div>
                        <div className="text-[10px] text-white/50 truncate">Personal Splitter View & Info</div>
                      </div>
                    </div>
                  </button>

                  <div className="h-px bg-white/10 my-2" />

                  {/* User Direct Conversations */}
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChatUser(c.partner)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        activeChatUser?.id === c.partner.id ? "bg-[#00F2FE]/15 border-[#00F2FE]/40" : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="font-bold text-xs text-white truncate">@{c.partner.username}</div>
                        <span className="text-[9px] text-white/40 font-mono">12:45</span>
                      </div>
                      <div className="text-[10px] text-white/50 truncate">{c.lastMessage || "Encrypted thread"}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Messenger Main Chat Pane ─────────────────────────────────── */}
              <div className="flex-1 flex flex-col bg-[#0C0C0C]">
                {activeChatUser ? (
                  activeChatUser.isOwnProfileSpace ? (
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                      <UserProfileSplitter
                        user={{
                          id: myUser?.id || "me",
                          username: myUser?.username || settingsForm.username || "alex",
                          fullName: "Alex Miller",
                          email: myUser?.email || "alex@ahoj.app",
                          message: settingsForm.message,
                          bio:
                            settingsForm.bio ||
                            "Software developer & proximity enthusiast in Brno. Building real-time interactive apps with Ant Design v6 and React.",
                          avatarUrl:
                            myUser?.avatarUrl || settingsForm.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg",
                          privacyMode: settingsForm.privacyMode as any,
                          distanceMeters: 0,
                          locationName: "Brno Center 📍",
                          lastActive: "Just now",
                          plusOneCount: 42,
                        }}
                        isOwnProfile={true}
                        onEditProfile={() => setActiveTab("settings")}
                        onUploadPhoto={() => setIsStoryModalOpen(true)}
                      />
                    </div>
                  ) : activeChatUser.isSystem || activeChatUser.id === "ahoj-notifications" ? (
                    <>
                      {/* System Notification Stream Header */}
                      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#121212]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00F2FE] to-purple-600 p-0.5 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                            <div className="w-full h-full rounded-[14px] bg-[#0C0C0C] flex items-center justify-center text-[#00F2FE] font-black text-sm">
                              /A\
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              {activeChatUser.username}
                              <span className="px-2 py-0.5 rounded-full bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 text-[10px] font-bold">
                                Official Bot
                              </span>
                            </div>
                            <div className="text-[10px] text-white/50">Real-time proximity alerts, spark invites & system notifications</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-[#00F2FE]">
                            {inAppNotifications.filter((n) => n.unread).length} Unread
                          </span>
                        </div>
                      </div>

                      {/* Notification Cards List */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        {notificationToast && (
                          <div className="p-3.5 rounded-2xl bg-[#00F2FE]/20 border border-[#00F2FE] text-[#00F2FE] text-xs font-bold flex items-center gap-2 animate-fadeIn sticky top-0 z-20 backdrop-blur-md shadow-lg">
                            <CheckCircle2 size={16} /> {notificationToast}
                          </div>
                        )}

                        {inAppNotifications.map((n) => (
                          <div
                            key={n.id}
                            className={`glass-panel p-4.5 rounded-3xl border transition-all space-y-3 ${
                              n.unread
                                ? "border-[#00F2FE]/40 bg-gradient-to-r from-[#00F2FE]/10 via-[#121212] to-[#121212] shadow-[0_0_20px_rgba(0,242,254,0.1)]"
                                : "border-white/10 bg-[#121212]/80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                {n.avatarUrl ? (
                                  <img src={n.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#00F2FE]/50" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] text-xs font-bold">
                                    /A\
                                  </div>
                                )}
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-[#00F2FE] border border-white/10 uppercase tracking-wider font-mono">
                                  {n.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-white/40 font-mono">{n.timestamp}</span>
                                {n.unread && <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-xs text-white">{n.title}</h4>
                              <p className="text-xs text-white/80 leading-relaxed font-normal">{n.body}</p>
                            </div>

                            {/* Action Buttons */}
                            {n.actions && n.actions.length > 0 && (
                              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                                {n.actions.map((act: any) => {
                                  let btnStyle = "bg-white/10 text-white hover:bg-white/20";
                                  if (act.variant === "primary") btnStyle = "bg-[#00F2FE] text-black font-bold hover:scale-105 shadow-[0_0_12px_rgba(0,242,254,0.3)]";
                                  if (act.variant === "success") btnStyle = "bg-[#4CAF50] text-black font-bold hover:scale-105";
                                  if (act.variant === "danger") btnStyle = "bg-[#F44336]/20 text-[#F44336] border border-[#F44336]/40 font-bold hover:bg-[#F44336]/30";

                                  return (
                                    <button
                                      key={act.id}
                                      type="button"
                                      onClick={() => handleNotificationAction(n.id, act.type, n.targetUserIndex)}
                                      className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${btnStyle}`}
                                    >
                                      {act.label}
                                    </button>
                                  );
                                })}

                                {n.requestStatus && (
                                  <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                                    n.requestStatus === "APPROVED" ? "bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/40" : "bg-[#F44336]/20 text-[#F44336] border border-[#F44336]/40"
                                  }`}>
                                    {n.requestStatus === "APPROVED" ? "✓ Approved" : "✕ Denied"}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Assistant Query Bar */}
                      <div className="p-4 border-t border-white/10 flex gap-2 bg-white/[0.02]">
                        <input
                          type="text"
                          value={typedMessage}
                          onChange={(e) => setTypedMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && typedMessage.trim()) {
                              const newNotif = {
                                id: `notif-${Date.now()}`,
                                title: "Ahoj Notification Assistant 🤖",
                                body: `Answer for "${typedMessage}": Proximity alerts & Sparks update in real time. Use settings to control visibility!`,
                                timestamp: "Just now",
                                category: "SYSTEM",
                                unread: false,
                                actions: [{ id: "set", label: "Open Settings ⚙️", type: "OPEN_SETTINGS", variant: "secondary" }],
                              };
                              setInAppNotifications((prev) => [newNotif, ...prev]);
                              setTypedMessage("");
                            }
                          }}
                          placeholder="Ask Notification Assistant (e.g. 'How do Sparks work?')..."
                          className="flex-1 glass-input px-4 py-3 rounded-2xl text-xs text-white placeholder-white/40"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (typedMessage.trim()) {
                              const newNotif = {
                                id: `notif-${Date.now()}`,
                                title: "Ahoj Notification Assistant 🤖",
                                body: `Answer for "${typedMessage}": Proximity alerts & Sparks update in real time. Use settings to control visibility!`,
                                timestamp: "Just now",
                                category: "SYSTEM",
                                unread: false,
                                actions: [{ id: "set", label: "Open Settings ⚙️", type: "OPEN_SETTINGS", variant: "secondary" }],
                              };
                              setInAppNotifications((prev) => [newNotif, ...prev]);
                              setTypedMessage("");
                            }
                          }}
                          className="px-5 py-3 rounded-2xl bg-[#00F2FE] text-black font-bold text-xs hover:scale-105 transition-all cursor-pointer"
                        >
                          Ask Assistant
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Rich Messenger Chat Header */}
                      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#121212]/90 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={activeChatUser.avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
                              alt={activeChatUser.username}
                              className="w-10 h-10 rounded-2xl object-cover border border-[#00F2FE]/50"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4CAF50] border-2 border-[#121212]" />
                          </div>

                          <div>
                            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              @{activeChatUser.username}
                              <span className="text-[10px] font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#00F2FE]/30">
                                ~{activeChatUser.distanceMeters ?? 320}m away
                              </span>
                            </div>
                            <div className="text-[10px] text-[#4CAF50] font-medium flex items-center gap-1">
                              <Lock size={10} /> End-to-End Encrypted Signal Thread
                            </div>
                          </div>
                        </div>

                        {/* Messenger Top Action Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileUser(activeChatUser)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#00F2FE]/15 text-white/70 hover:text-[#00F2FE] border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <User size={13} /> Profile Splitter
                          </button>
                        </div>
                      </div>

                      {/* Messenger Message Stream */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[radial-gradient(ellipse_at_top,rgba(0,242,254,0.03),transparent_70%)]">
                        {messages.map((m) => (
                          <div key={m.id} className={`flex ${m.senderId === myUser?.id ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 shadow-lg ${
                                m.senderId === myUser?.id
                                  ? "bg-gradient-to-r from-[#00F2FE] to-[#00DCE6] text-black font-semibold rounded-br-none"
                                  : "bg-[#181818] text-white border border-white/10 rounded-bl-none"
                              }`}
                            >
                              <p className="leading-relaxed">{m.content}</p>
                              <div className={`text-[9px] font-mono text-right ${m.senderId === myUser?.id ? "text-black/60" : "text-white/40"}`}>
                                12:46 · Read ✓✓
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Rich Messenger Composer Toolbar */}
                      <div className="p-3.5 border-t border-white/10 flex items-center gap-2 bg-[#121212]">
                        <button
                          type="button"
                          onClick={() => setIsStoryModalOpen(true)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#00F2FE] transition-colors"
                          title="Attach Photo / Story"
                        >
                          <Camera size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => alert("Voice message recording started... 🎙️")}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#00F2FE] transition-colors"
                          title="Voice Note"
                        >
                          <Zap size={16} />
                        </button>

                        <input
                          type="text"
                          value={typedMessage}
                          onChange={(e) => setTypedMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && typedMessage.trim()) {
                              handleSendMessage(typedMessage);
                              setTypedMessage("");
                            }
                          }}
                          placeholder="Type encrypted message..."
                          className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs text-white placeholder-white/40"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (typedMessage.trim()) {
                              handleSendMessage(typedMessage);
                              setTypedMessage("");
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
                        >
                          <Send size={14} /> Send
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs font-medium space-y-3 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#00F2FE]">
                      <MessageSquare size={28} />
                    </div>
                    <h4 className="font-bold text-sm text-white">Your Encrypted Messenger</h4>
                    <p className="max-w-xs text-white/50 text-[11px]">
                      Select a conversation on the left, or open System Alerts or My Profile.
                    </p>
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

          {/* TAB 5: USER PROFILE WITH ANT DESIGN SPLITTER */}
          {activeTab === "profile" && (
            <div className="h-[calc(100vh-65px)] p-4 md:p-6">
              <UserProfileSplitter
                user={{
                  id: myUser?.id || "me",
                  username: myUser?.username || settingsForm.username || "alex",
                  fullName: "Alex Miller",
                  email: myUser?.email || "alex@ahoj.app",
                  message: settingsForm.message,
                  bio:
                    settingsForm.bio ||
                    "Software developer & proximity enthusiast in Brno. Building real-time interactive apps with Ant Design v6 and React.",
                  avatarUrl:
                    myUser?.avatarUrl || settingsForm.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg",
                  privacyMode: settingsForm.privacyMode as any,
                  distanceMeters: 0,
                  locationName: "Brno Center 📍",
                  lastActive: "Just now",
                  plusOneCount: 42,
                }}
                isOwnProfile={true}
                onEditProfile={() => setActiveTab("settings")}
                onUploadPhoto={() => setIsStoryModalOpen(true)}
              />
            </div>
          )}

          {/* TAB 6: APP SETTINGS PAGE (NARROW CONTAINER) */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">

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

      {/* ── 6. SELECTED USER PROFILE SPLITTER MODAL ───────────────────────── */}
      {selectedProfileUser && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl h-[88vh] bg-[#0C0C0C] rounded-3xl overflow-hidden border border-[#00F2FE]/40 shadow-2xl flex flex-col">
            <button
              type="button"
              onClick={() => setSelectedProfileUser(null)}
              className="absolute top-3.5 right-4 z-30 p-2 rounded-2xl bg-black/70 text-white/70 hover:text-white border border-white/20 hover:bg-black transition-all cursor-pointer"
              title="Close Profile"
            >
              <X size={18} />
            </button>
            <UserProfileSplitter
              user={selectedProfileUser}
              isOwnProfile={selectedProfileUser.id === myUser?.id}
              onStartChat={(u) => {
                setSelectedProfileUser(null);
                setActiveChatUser(u);
                setActiveTab("chats");
              }}
            />
          </div>
        </div>
      )}

      {/* ── 7. MOBILE BOTTOM NAVIGATION BAR (Phones) ───────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 flex items-center justify-around md:hidden shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        {[
          { id: "feed", label: t.radarTitle, icon: <Compass size={20} /> },
          { id: "sparks", label: t.sparksTitle, icon: <Flame size={20} /> },
          { id: "chats", label: t.chatsTitle, icon: <MessageSquare size={20} /> },
          { id: "requests", label: t.requestsTitle, icon: <Lock size={20} /> },
          { id: "profile", label: "Profile", icon: <User size={20} /> },
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
