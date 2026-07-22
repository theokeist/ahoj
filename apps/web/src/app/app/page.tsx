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
} from "lucide-react";
import Navigation from "../../components/Navigation";
import { webApi } from "../../lib/api";
import { MOCK_NEARBY_USERS } from "../../lib/mockData";

export default function FullWebAppDashboard() {
  const router = useRouter();

  // Auth Guard & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [myUser, setMyUser] = useState<any>(null);

  // Tab & Control States
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "profile" | "requests">("feed");
  const [radiusKm, setRadiusKm] = useState<number>(2);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);

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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Modals & Story Viewers
  const [selectedStoryUser, setSelectedStoryUser] = useState<any | null>(null);
  const [storyProgress, setStoryProgress] = useState<number>(0);
  const [isCreateSparkOpen, setIsCreateSparkOpen] = useState<boolean>(false);
  const [newSparkTitle, setNewSparkTitle] = useState<string>("");
  const [newSparkCategory, setNewSparkCategory] = useState<string>("COFFEE");

  // Story Creator Modal
  const [isAddStoryOpen, setIsAddStoryOpen] = useState<boolean>(false);
  const [storyMediaUrl, setStoryMediaUrl] = useState<string>("");
  const [storyCaption, setStoryCaption] = useState<string>("");

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

    // Validate token with backend /auth/me
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

    // Request browser Geolocation if permitted
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Use default coordinates if denied
        }
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
        setNearbyUsers(nearbyRes.value.users.length ? nearbyRes.value.users : MOCK_NEARBY_USERS);
      } else {
        setNearbyUsers(MOCK_NEARBY_USERS);
      }

      if (sparksRes.status === "fulfilled") {
        setSparks(sparksRes.value.sparks);
      }

      if (convsRes.status === "fulfilled") {
        setConversations(convsRes.value.conversations);
      }

      if (reqsRes.status === "fulfilled") {
        setIncomingRequests(reqsRes.value.requests);
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

  // Setup Real-Time Socket.io Connection
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("accessToken");
    const socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("new_message", (msg: any) => {
      if (activeChatUser && (msg.senderId === activeChatUser.id || msg.receiverId === activeChatUser.id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, activeChatUser]);

  // Load Chat Messages when Chat Partner Changes
  useEffect(() => {
    if (activeChatUser) {
      webApi
        .getMessages(activeChatUser.id)
        .then((res) => setMessages(res.messages))
        .catch(() => {
          setMessages([
            { id: "m1", senderId: activeChatUser.id, text: "Ahoj! Down to grab coffee nearby?", createdAt: new Date().toISOString() },
          ]);
        });
    }
  }, [activeChatUser]);

  // Scroll Chat to Bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Story Autoplay Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedStoryUser) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
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
  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !activeChatUser) return;
    const text = typedMessage.trim();
    setTypedMessage("");

    // Optimistic UI update
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
      // Message saved locally
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
      setSparks([res.spark, ...sparks]);
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
      setSparks([newSpark, ...sparks]);
      setNewSparkTitle("");
      setIsCreateSparkOpen(false);
    }
  };

  const handlePublishStory = async () => {
    if (!storyMediaUrl.trim()) return;
    try {
      await webApi.uploadStory(storyMediaUrl, storyCaption);
      setIsAddStoryOpen(false);
      setStoryMediaUrl("");
      setStoryCaption("");
      loadAppData();
    } catch {
      setIsAddStoryOpen(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await webApi.approveAccess(id);
      setIncomingRequests(incomingRequests.filter((r) => r.id !== id));
    } catch {
      setIncomingRequests(incomingRequests.filter((r) => r.id !== id));
    }
  };

  const handleDenyRequest = async (id: string) => {
    try {
      await webApi.denyAccess(id);
      setIncomingRequests(incomingRequests.filter((r) => r.id !== id));
    } catch {
      setIncomingRequests(incomingRequests.filter((r) => r.id !== id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    router.replace("/login");
  };

  // Loading Shield
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#00F2FE] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#00F2FE]">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col font-sans">
      <Navigation />

      {/* Main Authenticated Dashboard Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 pb-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Desktop Sidebar — Profile, Radius & Controls */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 gap-6 glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center overflow-hidden">
              <img
                src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base truncate">@{myUser?.username || "dev_user"}</h3>
              <p className="text-xs text-[#00F2FE] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" /> Online • Brno Radar
              </p>
            </div>
          </div>

          {/* Proximity Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/60">Search Radius</span>
              <span className="text-[#00F2FE]">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-[#00F2FE] cursor-pointer"
            />
          </div>

          {/* Ghost Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 text-[#FF6B6B]" />
              <div>
                <div className="text-xs font-bold text-white">Ghost Mode</div>
                <div className="text-[10px] text-white/40">Fuzz telemetry on radar</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGhostMode(!isGhostMode)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                isGhostMode ? "bg-[#FF6B6B]" : "bg-white/20"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isGhostMode ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Story Access Requests Quick Button */}
          {incomingRequests.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className="p-3 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00F2FE]" />
                <span className="text-xs font-bold text-white">Access Requests</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#00F2FE] text-black text-[10px] font-black">
                {incomingRequests.length}
              </span>
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Log out of ahoj
          </button>
        </div>

        {/* Center Mobile-First Frame Container */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-[#121212] border border-white/10 rounded-[36px] overflow-hidden shadow-2xl min-h-[720px] relative">
          
          {/* App Shell Top Navigation */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between bg-[#121212]/90 backdrop-blur-md sticky top-0 z-20">
            <span className="text-xl font-black text-[#00F2FE] tracking-tighter">/A\ ahoj</span>
            <span className="text-sm font-bold capitalize text-white">{activeTab}</span>
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

          {/* Ghost Mode Active Banner */}
          {isGhostMode && (
            <div className="bg-[#FF6B6B]/15 border-b border-[#FF6B6B]/30 px-4 py-2 text-center text-xs font-semibold text-[#FF6B6B] flex items-center justify-center gap-1.5">
              <span>👻 Ghost Mode Active — Hidden on radar feed</span>
            </div>
          )}

          {/* TAB 1: RADAR / PROXIMITY FEED */}
          {activeTab === "feed" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* 24h Story Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/60">
                  <span>24h Stories</span>
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(true)}
                    className="text-[#00F2FE] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post Story
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {/* Create My Story Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(true)}
                    className="flex flex-col items-center gap-1 shrink-0 group"
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

                  {/* Nearby User Stories */}
                  {nearbyUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedStoryUser(user)}
                      className="flex flex-col items-center gap-1 shrink-0 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00F2FE] to-[#FF6B6B] p-0.5 relative">
                        <img
                          src={user.avatarUrl || user.profilePhotoUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.username}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-white/70 font-medium truncate w-14 text-center">@{user.username}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nearby People List */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/60">
                  <span>Nearby People ({nearbyUsers.length})</span>
                  <span>&le; {radiusKm} km</span>
                </div>

                {nearbyUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-[#00F2FE]/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 relative shrink-0">
                        <img
                          src={user.avatarUrl || user.profilePhotoUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.username}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white truncate">@{user.username}</span>
                        </div>
                        <p className="text-xs text-white/60 truncate">{user.message || user.bio || "Exploring nearby!"}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#00F2FE] font-mono">~{user.distanceMeters || 150}m</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChatUser(user);
                          setActiveTab("chats");
                        }}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white border border-white/10"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPARKS */}
          {activeTab === "sparks" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-white">⚡ Nearby Sparks</h3>
                  <p className="text-xs text-white/50">Spontaneous 2-hour meetups around you</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateSparkOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#00F2FE] text-black text-xs font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                >
                  <Plus className="w-4 h-4" /> Create
                </button>
              </div>

              <div className="space-y-3">
                {sparks.map((spark) => (
                  <div key={spark.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                          <img
                            src={spark.userAvatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + spark.username}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">@{spark.username}</span>
                          <span className="text-[10px] text-white/40 block">{spark.createdAt}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#00F2FE]/15 border border-[#00F2FE]/30 text-[10px] font-bold text-[#00F2FE]">
                        {spark.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{spark.title}</h4>
                    {spark.description && <p className="text-xs text-white/70">{spark.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CHATS */}
          {activeTab === "chats" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeChatUser ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveChatUser(null)}
                      className="text-xs text-[#00F2FE] font-bold"
                    >
                      &larr; Back
                    </button>
                    <span className="text-sm font-bold text-white">@{activeChatUser.username}</span>
                    <div className="w-4" />
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === myUser?.id || msg.sender === "me";
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                            isMe
                              ? "bg-[#00F2FE] text-black font-medium ml-auto rounded-tr-none"
                              : "bg-white/10 text-white mr-auto rounded-tl-none border border-white/10"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  <div className="p-3 border-t border-white/10 bg-[#121212] flex items-center gap-2">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 glass-input px-4 py-2.5 rounded-full text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="w-9 h-9 rounded-full bg-[#00F2FE] text-black flex items-center justify-center font-bold shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-xs font-bold text-white/60">Active Conversations</div>
                  {nearbyUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setActiveChatUser(user)}
                      className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00F2FE]/40 flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                          <img
                            src={user.avatarUrl || user.profilePhotoUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.username}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">@{user.username}</div>
                          <div className="text-[11px] text-white/50 line-clamp-1">{user.message || "Tap to chat"}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCESS REQUESTS */}
          {activeTab === "requests" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-xs font-bold text-white/60">Story Access Requests</div>
              {incomingRequests.length === 0 ? (
                <div className="text-center py-12 text-xs text-white/40">No pending access requests 🌟</div>
              ) : (
                incomingRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <img
                          src={req.requester?.profilePhotoUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + req.requester?.username}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-xs text-white">@{req.requester?.username}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id)}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-bold"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDenyRequest(req.id)}
                        className="px-3 py-1 rounded-xl bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00F2FE] p-0.5">
                  <img
                    src={myUser?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user"}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">@{myUser?.username || "dev_user"}</h3>
                  <p className="text-xs text-white/60">{myUser?.email || "dev@ahoj.app"}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-red-500/20 border border-red-500 text-red-400 font-bold text-xs"
              >
                Log Out
              </button>
            </div>
          )}

          {/* Bottom Tab Bar */}
          <div className="h-16 border-t border-white/10 bg-[#121212] flex items-center justify-around px-2 z-20">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={`flex flex-col items-center gap-1 ${activeTab === "feed" ? "text-[#00F2FE]" : "text-white/40"}`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-bold">Radar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sparks")}
              className={`flex flex-col items-center gap-1 ${activeTab === "sparks" ? "text-[#00F2FE]" : "text-white/40"}`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] font-bold">Sparks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chats")}
              className={`flex flex-col items-center gap-1 ${activeTab === "chats" ? "text-[#00F2FE]" : "text-white/40"}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold">Chats</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center gap-1 ${activeTab === "profile" ? "text-[#00F2FE]" : "text-white/40"}`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold">Profile</span>
            </button>
          </div>
        </div>
      </main>

      {/* Story Viewer Modal */}
      {selectedStoryUser && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-3xl overflow-hidden relative flex flex-col border border-white/10">
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden z-30">
              <div className="h-full bg-[#00F2FE] transition-all duration-100 ease-linear" style={{ width: `${storyProgress}%` }} />
            </div>
            <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={selectedStoryUser.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + selectedStoryUser.username}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-white text-xs font-bold">@{selectedStoryUser.username}</span>
              </div>
              <button type="button" onClick={() => setSelectedStoryUser(null)} className="text-white text-sm font-bold">✕</button>
            </div>
            <img
              src={selectedStoryUser.stories?.[0] || selectedStoryUser.avatarUrl || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600"}
              alt="Story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">🎬 Post 24h Story</h3>
              <button type="button" onClick={() => setIsAddStoryOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <input
              type="text"
              value={storyMediaUrl}
              onChange={(e) => setStoryMediaUrl(e.target.value)}
              placeholder="Image URL (e.g. https://...)"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
            />
            <input
              type="text"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder="Caption (Optional)"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
            />
            <button
              type="button"
              onClick={handlePublishStory}
              className="w-full py-3 rounded-xl bg-[#00F2FE] text-black font-bold text-xs"
            >
              Publish Story
            </button>
          </div>
        </div>
      )}

      {/* Create Spark Modal */}
      {isCreateSparkOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">⚡ Create Nearby Spark</h3>
              <button type="button" onClick={() => setIsCreateSparkOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <input
              type="text"
              value={newSparkTitle}
              onChange={(e) => setNewSparkTitle(e.target.value)}
              placeholder="What are you up to?"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
            />
            <button
              type="button"
              onClick={handleCreateSpark}
              className="w-full py-3 rounded-xl bg-[#00F2FE] text-black font-bold text-xs"
            >
              Publish Spark (2h Expiry)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
