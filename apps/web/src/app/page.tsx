"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  RefreshCw,
  LogOut,
  ChevronRight,
  Check,
  X,
  Ghost,
} from "lucide-react";
import Navigation from "../components/Navigation";
import { MOCK_NEARBY_USERS, Message } from "../lib/mockData";

export default function CoreWebApp() {
  // Navigation & Active Tab
  const [activeTab, setActiveTab] = useState<"feed" | "sparks" | "chats" | "profile">("feed");
  const [radiusKm, setRadiusKm] = useState(2);
  const [isGhostMode, setIsGhostMode] = useState(false);

  // Auth User State
  const [myUser, setMyUser] = useState({
    username: "dev_user",
    email: "dev@ahoj.app",
    message: "Coding the next-gen proximity social network! ⚡",
    bio: "Exploring local spots & tech in Brno 🏔️",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user",
    privacyMode: "PUBLIC",
  });

  // Story & Modal States
  const [selectedStoryUser, setSelectedStoryUser] = useState<typeof MOCK_NEARBY_USERS[0] | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Sparks (Spontaneous Meetups) State
  const [sparks, setSparks] = useState([
    {
      id: "s1",
      username: "bob_nearby",
      userAvatarUrl: MOCK_NEARBY_USERS[0].avatarUrl,
      title: "Anyone down for coffee at Cafe Nero?",
      description: "Sitting outside, let's chat tech or sports!",
      category: "COFFEE",
      distanceMeters: 250,
      createdAt: "10m ago",
    },
    {
      id: "s2",
      username: "alice_active",
      userAvatarUrl: MOCK_NEARBY_USERS[1].avatarUrl,
      title: "Beach Volleyball at Central Park",
      description: "Looking for 2 players to join a quick match!",
      category: "SPORTS",
      distanceMeters: 600,
      createdAt: "25m ago",
    },
  ]);
  const [isCreateSparkOpen, setIsCreateSparkOpen] = useState(false);
  const [newSparkTitle, setNewSparkTitle] = useState("");
  const [newSparkCategory, setNewSparkCategory] = useState<"COFFEE" | "SPORTS" | "PARTY" | "STUDY" | "MEETUP">("COFFEE");

  // Private Access Requests Simulation
  const [pendingRequests, setPendingRequests] = useState<Record<string, "NONE" | "PENDING" | "APPROVED">>({});
  const [unlockedPrivate, setUnlockedPrivate] = useState<Record<string, boolean>>({});

  // Active Chat State
  const [activeChatUser, setActiveChatUser] = useState<typeof MOCK_NEARBY_USERS[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    "1": [
      { id: "m1", sender: "partner", text: "Hey! Saw you are nearby. Down for coffee?", timestamp: "14:20" },
      { id: "m2", sender: "me", text: "Hey Natalie! Sounds great, where are you?", timestamp: "14:22" },
    ],
  });
  const [typedMessage, setTypedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll chat to bottom
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChatUser, isTyping]);

  // Story playback timer
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

  // Access request handler
  const handleRequestAccess = (userId: string) => {
    setPendingRequests((prev) => ({ ...prev, [userId]: "PENDING" }));
    setTimeout(() => {
      setPendingRequests((prev) => ({ ...prev, [userId]: "APPROVED" }));
      setUnlockedPrivate((prev) => ({ ...prev, [userId]: true }));
    }, 2000);
  };

  // Send Chat Message
  const handleSendMessage = () => {
    if (!typedMessage.trim() || !activeChatUser) return;
    const userKey = activeChatUser.id;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: typedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [userKey]: [...(prev[userKey] || []), newMsg],
    }));
    setTypedMessage("");

    // Automated partner response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const partnerMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "partner",
        text: "Sounds perfect! Let's catch up right away. 👍",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [userKey]: [...(prev[userKey] || []), partnerMsg],
      }));
    }, 1500);
  };

  // Create Spark
  const handleCreateSpark = () => {
    if (!newSparkTitle.trim()) return;
    const newSpark = {
      id: Date.now().toString(),
      username: myUser.username,
      userAvatarUrl: myUser.avatarUrl,
      title: newSparkTitle,
      description: "Spontaneous meetup ping created nearby!",
      category: newSparkCategory,
      distanceMeters: 50,
      createdAt: "Just now",
    };
    setSparks([newSpark, ...sparks]);
    setNewSparkTitle("");
    setIsCreateSparkOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col font-sans">
      <Navigation />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 pb-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Desktop Sidebar — Settings & Controls */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 gap-6 glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center overflow-hidden">
              <img src={myUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">@{myUser.username}</h3>
              <p className="text-xs text-[#00F2FE] font-medium">Online • Brno Radar</p>
            </div>
          </div>

          {/* Search Radius */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/60">Proximity Radius</span>
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
                <div className="text-[10px] text-white/40">Hide location on radar</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGhostMode(!isGhostMode)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                isGhostMode ? "bg-[#FF6B6B]" : "bg-white/20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isGhostMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Demo User Switcher */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-white/50">Quick Demo User Switcher</div>
            <button
              type="button"
              onClick={() => setMyUser({
                username: "dev_user",
                email: "dev@ahoj.app",
                message: "Coding the next-gen proximity social network! ⚡",
                bio: "Exploring local spots & tech in Brno 🏔️",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=dev_user",
                privacyMode: "PUBLIC",
              })}
              className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium flex items-center justify-between"
            >
              <span>@dev_user (Dev Account)</span>
              <Check className="w-3.5 h-3.5 text-[#00F2FE]" />
            </button>
          </div>
        </div>

        {/* Center Mobile-First Frame */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-[#121212] border border-white/10 rounded-[36px] overflow-hidden shadow-2xl min-h-[720px] relative">
          
          {/* Mobile Top Header */}
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
              <span>👻 Ghost Mode Active — You are hidden from radar</span>
            </div>
          )}

          {/* TAB 1: RADAR / FEED */}
          {activeTab === "feed" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Story Bar */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white/60">24h Stories</div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {/* My Story */}
                  <button
                    type="button"
                    onClick={() => setSelectedStoryUser(MOCK_NEARBY_USERS[0])}
                    className="flex flex-col items-center gap-1 shrink-0 group"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-[#00F2FE] p-0.5 relative">
                      <img src={myUser.avatarUrl} alt="My story" className="w-full h-full rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00F2FE] text-black text-xs font-bold flex items-center justify-center">+</div>
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">My Story</span>
                  </button>

                  {/* Nearby User Stories */}
                  {MOCK_NEARBY_USERS.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        if (user.privacyMode === "PUBLIC" || unlockedPrivate[user.id]) {
                          setSelectedStoryUser(user);
                        } else {
                          handleRequestAccess(user.id);
                        }
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00F2FE] to-[#FF6B6B] p-0.5 relative">
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className={`w-full h-full rounded-full object-cover ${
                            user.privacyMode === "PRIVATE" && !unlockedPrivate[user.id] ? "blur-sm opacity-50" : ""
                          }`}
                        />
                        {user.privacyMode === "PRIVATE" && !unlockedPrivate[user.id] && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs">🔒</div>
                        )}
                      </div>
                      <span className="text-[10px] text-white/70 font-medium truncate w-14 text-center">@{user.username}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Feed List */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-white/60">
                  <span>Nearby People ({MOCK_NEARBY_USERS.length})</span>
                  <span>&le; {radiusKm} km</span>
                </div>

                {MOCK_NEARBY_USERS.map((user) => {
                  const isPrivate = user.privacyMode === "PRIVATE";
                  const isUnlocked = unlockedPrivate[user.id];
                  const requestStatus = pendingRequests[user.id] || "NONE";

                  return (
                    <div
                      key={user.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-[#00F2FE]/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 relative">
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className={`w-full h-full object-cover ${
                              isPrivate && !isUnlocked ? "blur-sm opacity-40" : ""
                            }`}
                          />
                          {isPrivate && !isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs">🔒</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">@{user.username}</span>
                            {isPrivate && <Lock className="w-3 h-3 text-white/40" />}
                          </div>
                          <p className="text-xs text-white/60 line-clamp-1">{user.message}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] text-[#00F2FE] font-mono">~{user.distanceMeters}m</span>
                        {isPrivate && !isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleRequestAccess(user.id)}
                            className="px-3 py-1 rounded-full bg-[#00F2FE]/15 border border-[#00F2FE]/40 text-[10px] font-bold text-[#00F2FE]"
                          >
                            {requestStatus === "PENDING" ? "Requested..." : "Request"}
                          </button>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SPARKS (Spontaneous Meetups) */}
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

              {/* Sparks list */}
              <div className="space-y-3">
                {sparks.map((spark) => (
                  <div key={spark.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                          <img src={spark.userAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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
                /* Chat Thread Window */
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
                    {(chatMessages[activeChatUser.id] || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                          msg.sender === "me"
                            ? "bg-[#00F2FE] text-black font-medium ml-auto rounded-tr-none"
                            : "bg-white/10 text-white mr-auto rounded-tl-none border border-white/10"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`text-[9px] block text-right mt-1 ${msg.sender === "me" ? "text-black/60" : "text-white/40"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="bg-white/10 p-2.5 rounded-2xl rounded-tl-none max-w-[80%] mr-auto">
                        <span className="text-xs text-white/50 animate-pulse">Typing reply...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input Bar */}
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
                /* Recent Threads List */
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-xs font-bold text-white/60">Active Conversations</div>
                  {MOCK_NEARBY_USERS.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setActiveChatUser(user)}
                      className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00F2FE]/40 flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">@{user.username}</div>
                          <div className="text-[11px] text-white/50 line-clamp-1">{user.message}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & SETTINGS */}
          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00F2FE] p-0.5">
                  <img src={myUser.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">@{myUser.username}</h3>
                  <p className="text-xs text-white/60">{myUser.bio}</p>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 block">Radar Status Message</label>
                <input
                  type="text"
                  value={myUser.message}
                  onChange={(e) => setMyUser({ ...myUser, message: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
                />
              </div>

              {/* Privacy Setting */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Ghost Mode</div>
                  <div className="text-[10px] text-white/40">Fuzz location on nearby feed</div>
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

      {/* Story Fullscreen Viewer Modal */}
      {selectedStoryUser && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-3xl overflow-hidden relative flex flex-col border border-white/10">
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden z-30">
              <div className="h-full bg-[#00F2FE] transition-all duration-100 ease-linear" style={{ width: `${storyProgress}%` }} />
            </div>
            <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={selectedStoryUser.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                <span className="text-white text-xs font-bold">@{selectedStoryUser.username}</span>
              </div>
              <button type="button" onClick={() => setSelectedStoryUser(null)} className="text-white text-sm font-bold">✕</button>
            </div>
            <img src={selectedStoryUser.stories[0] || selectedStoryUser.avatarUrl} alt="Story" className="w-full h-full object-cover" />
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
            <div className="flex gap-2 flex-wrap">
              {(["COFFEE", "SPORTS", "PARTY", "STUDY", "MEETUP"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewSparkCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    newSparkCategory === cat ? "bg-[#00F2FE] text-black" : "bg-white/10 text-white/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
