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
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "profile" | "requests">("feed");
  const [radiusKm, setRadiusKm] = useState<number>(2);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "radar">("grid");

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
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#00F2FE] animate-spin" />
          <span className="text-xs text-white/60 font-semibold tracking-wider uppercase">Loading ahoj Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col font-sans">
      
      {/* AUTHENTICATED APP HEADER (NON-OVERLAPPING) */}
      <header className="sticky top-0 z-40 bg-[#0C0C0C]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <span className="text-2xl font-black text-[#00F2FE] tracking-tighter">/A\</span>
              <span className="text-lg font-bold tracking-tight text-white">ahoj</span>
            </Link>
            <span className="text-[10px] bg-[#00F2FE]/15 text-[#00F2FE] font-bold px-2 py-0.5 rounded-full border border-[#00F2FE]/30 hidden sm:inline-block">
              Web App Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <img
                src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                alt="My profile"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-white hidden sm:inline-block">@{myUser?.username || "dev_user"}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: PROFILE & CONTROL CENTER */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-[#00F2FE]/40 p-0.5">
                <img
                  src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                  alt="My avatar"
                  className="w-full h-full rounded-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#0C0C0C]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">@{myUser?.username || "dev_user"}</h3>
                <span className="text-xs text-[#00F2FE] font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Proximity Verified
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
              <span className="text-white/40 font-semibold uppercase text-[10px]">Status Message</span>
              <p className="text-white/90 italic">&quot;{myUser?.message || "Ahoj! Exploring nearby spots 📍"}&quot;</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-semibold text-white/70">
                <span>Radar Radius</span>
                <span className="text-[#00F2FE] font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-[#00F2FE] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="glass-panel p-3 rounded-3xl space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === "feed" ? "bg-[#00F2FE] text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2.5"><Compass className="w-4 h-4" /> Nearby Radar</span>
              <span className="text-[10px] opacity-80">{(nearbyUsers || []).length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sparks")}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === "sparks" ? "bg-[#00F2FE] text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2.5"><Flame className="w-4 h-4" /> Sparks Meetups</span>
              <span className="text-[10px] opacity-80">{(sparks || []).length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chats")}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === "chats" ? "bg-[#00F2FE] text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2.5"><MessageSquare className="w-4 h-4" /> E2EE Messages</span>
              <span className="text-[10px] opacity-80">{(conversations || []).length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === "requests" ? "bg-[#00F2FE] text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2.5"><Lock className="w-4 h-4" /> Access Requests</span>
              {(incomingRequests?.length || 0) > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FF6B6B] text-black text-[9px] font-bold flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MAIN FEED & CHAT CANVAS */}
        <div className="lg:col-span-9 flex flex-col bg-[#121212] rounded-3xl border border-white/10 overflow-hidden min-h-[650px] relative">
          
          {/* Dashboard Control Bar */}
          <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-[#121212]/90 backdrop-blur-md sticky top-0 z-20">
            <span className="text-sm font-bold capitalize text-white flex items-center gap-2">
              {activeTab}
            </span>
            <div className="flex items-center gap-2">
              {activeTab === "feed" && (
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      viewMode === "grid" ? "bg-[#00F2FE] text-black" : "text-white/60"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("radar")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      viewMode === "radar" ? "bg-[#00F2FE] text-black" : "text-white/60"
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" /> Radar Ring
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsGhostMode(!isGhostMode)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isGhostMode ? "border-[#FF6B6B] bg-[#FF6B6B]/20 text-[#FF6B6B]" : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                <Ghost className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB 1: RADAR / PROXIMITY FEED */}
          {activeTab === "feed" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* 24h Story Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/60">
                  <span>24h Active Stories</span>
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(true)}
                    className="text-[#00F2FE] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post 24h Story
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(true)}
                    className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-[#00F2FE] p-0.5 relative bg-white/5">
                      <img
                        src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                        alt="My story"
                        className="w-full h-full rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00F2FE] text-black text-xs font-bold flex items-center justify-center">+</div>
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">Add Story</span>
                  </button>

                  {(nearbyUsers || []).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedStoryUser(user)}
                      className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full border-2 border-[#00F2FE] p-0.5 bg-white/5">
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
                    <div key={user.id} className="glass-panel p-4 rounded-2xl space-y-3 relative group">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
                          alt={user.username}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
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
                <div className="relative w-full h-[450px] bg-gradient-to-br from-[#0C0C0C] via-[#0A192F] to-[#052930] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.12)_0,transparent_70%)]" />
                  <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-radar" />
                  <div className="absolute w-[300px] h-[300px] rounded-full border border-[#00F2FE]/30 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-[#00F2FE]/20 border-2 border-[#00F2FE] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.5)] z-10">
                    <span className="text-xs font-bold text-[#00F2FE]">You</span>
                  </div>

                  {(nearbyUsers || []).map((user, idx) => {
                    const angle = (idx / nearbyUsers.length) * 2 * Math.PI;
                    const dist = 80 + (idx % 3) * 50;
                    const x = Math.cos(angle) * dist;
                    const y = Math.sin(angle) * dist;

                    return (
                      <div
                        key={user.id}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        className="absolute z-20 flex flex-col items-center gap-1 group cursor-pointer"
                        onClick={() => setSelectedStoryUser(user)}
                      >
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full border-2 border-[#00F2FE] object-cover shadow-lg"
                        />
                        <span className="text-[9px] bg-black/80 text-white font-bold px-1.5 py-0.5 rounded-full border border-white/20">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/60">Spontaneous Meetups (2h Expiry)</span>
                <button
                  type="button"
                  onClick={() => setIsCreateSparkOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#00F2FE] text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Spark
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(sparks || []).map((spark) => (
                  <div key={spark.id} className="glass-panel p-4 rounded-2xl space-y-2 border border-[#00F2FE]/30">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#00F2FE]/20 text-[#00F2FE]">
                        {spark.category}
                      </span>
                      <span className="text-[10px] text-white/50">2h active</span>
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
              <div className="w-1/3 border-r border-white/10 overflow-y-auto p-3 space-y-2">
                {(conversations || []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChatUser(c)}
                    className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer ${
                      activeChatUser?.id === c.id ? "bg-white/10 border border-[#00F2FE]/40" : "hover:bg-white/5"
                    }`}
                  >
                    <img src={c.avatarUrl} alt={c.username} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-white">@{c.username}</h4>
                      <p className="text-[10px] text-white/50 truncate">E2EE Signal Protected</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="w-2/3 flex flex-col bg-black/40">
                {activeChatUser ? (
                  <>
                    <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                      <span className="font-bold text-xs text-white">@{activeChatUser.username}</span>
                      <span className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Signal E2EE
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
                                ? "bg-[#00F2FE] text-black font-semibold"
                                : "bg-white/10 text-white"
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
                        className="px-4 py-2 rounded-xl bg-[#00F2FE] text-black font-bold text-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs">
                    <MessageSquare className="w-8 h-8 mb-2" /> Select a chat to start messaging
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS REQUESTS */}
          {activeTab === "requests" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <span className="text-xs font-bold text-white/60">Pending Story & Profile Access Requests</span>
              {(incomingRequests || []).length > 0 ? (
                incomingRequests.map((req) => (
                  <div key={req.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">@{req.requesterUsername}</h4>
                      <span className="text-xs text-white/50">Wants to unlock your 24h stories</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#10B981] text-black font-bold text-xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDenyRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs cursor-pointer"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/40 text-xs font-medium">
                  No pending access requests
                </div>
              )}
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
              {storyFilter === "greenscreen" && <div className="absolute inset-0 bg-[#10B981]/20 pointer-events-none" />}
              {storyFilter === "cyber" && <div className="absolute inset-0 bg-[#00F2FE]/20 pointer-events-none" />}
              {storyFilter === "retro" && <div className="absolute inset-0 bg-[#E67800]/15 pointer-events-none" />}
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
              <div className="absolute top-3 left-3 bg-[#10B981]/20 border border-[#10B981] px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#10B981] flex items-center gap-1">
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
              className="w-full py-3 rounded-xl bg-[#00F2FE] text-[#0C0C0C] font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)] cursor-pointer"
            >
              Publish to 24h Stories ⚡
            </button>
          </div>
        </div>
      )}

      {/* CREATE SPARK MODAL */}
      {isCreateSparkOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4">
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
