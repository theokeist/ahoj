"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Shield, MessageSquare, Flame, Sparkles, User, Lock, Unlock, Compass, Smartphone, Send } from "lucide-react";

// Mock users for the web simulator
const MOCK_NEARBY_USERS = [
  {
    id: "1",
    username: "natalie_s",
    message: "Hledám parťáka na turistiku 🏔️",
    distanceMeters: 120,
    hasActiveStories: true,
    stories: [
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600"
    ],
    bio: "Miluju hory, kafe a spontánní výlety. Hledám lidi se stejnou energii!",
    privacyMode: "PUBLIC",
    avatarColor: "bg-pink-500",
    initial: "N",
    replyTemplates: [
      "Ahoj! Zrovna balím batoh na víkend, plánuju Sněžku. Přidáš se? 🏔️",
      "Výlety plánuju většinou spontánně. Co máš v plánu ty?"
    ]
  },
  {
    id: "2",
    username: "kubajz",
    message: "Kávový závislák, napiš mi ☕",
    distanceMeters: 45,
    hasActiveStories: true,
    stories: [
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600"
    ],
    bio: "Pojďme na rychlé espresso a probrat cokoli. Brno střecha?",
    privacyMode: "PUBLIC",
    avatarColor: "bg-blue-500",
    initial: "K",
    replyTemplates: [
      "Ahoj! Zrovna sedím v kavárně za rohem. Mají tu skvělou Keňu, stav se! ☕",
      "Espresso je základ! Kdy máš čas?"
    ]
  },
  {
    id: "3",
    username: "secret_vibe",
    message: "DJ set dnes večer? Jdeme! 🎧",
    distanceMeters: 200,
    hasActiveStories: true,
    stories: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600"
    ],
    bio: "Techno, vinyls and late night talks.",
    privacyMode: "PRIVATE",
    avatarColor: "bg-purple-600",
    initial: "S",
    replyTemplates: [
      "Čau, díky za zprávu! Ten klub večer otvírá v 10. Lístky ještě jsou! 🎧",
      "Hraju hlavně industrial techno. Co posloucháš ty?"
    ]
  },
  {
    id: "4",
    username: "emma_art",
    message: "Kreslení v parku, přidej se 🎨",
    distanceMeters: 450,
    hasActiveStories: false,
    stories: [],
    bio: "Design student. Drawing people and cities. Catch me nearby.",
    privacyMode: "PUBLIC",
    avatarColor: "bg-yellow-500",
    initial: "E",
    replyTemplates: [
      "Ahoj! Kreslím zrovna stromy v parku pod hradem, vezmi si skicák a přijď! 🎨",
      "Používám hlavně uhel a akvarel. Zkoušíš taky?"
    ]
  }
];

type Message = {
  id: string;
  sender: "me" | "partner";
  text: string;
  timestamp: string;
};

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_NEARBY_USERS[0] | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [currentRadius, setCurrentRadius] = useState(2); // km
  const [storyProgress, setStoryProgress] = useState(0);

  // Private profile access simulation states
  const [privateUnlocked, setPrivateUnlocked] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<Record<string, "NONE" | "PENDING" | "APPROVED">>({});

  // Active chat state
  const [activeChatUser, setActiveChatUser] = useState<typeof MOCK_NEARBY_USERS[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [typedMessage, setTypedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChatUser, isTyping]);

  // Story autoplay effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedUser && selectedUser.hasActiveStories && selectedUser.stories.length > 0) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            // Next story
            setActiveStoryIdx((prevIdx) => {
              if (prevIdx < selectedUser.stories.length - 1) {
                return prevIdx + 1;
              } else {
                setSelectedUser(null);
                return 0;
              }
            });
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [selectedUser, activeStoryIdx]);

  // Request Access Handler
  const handleRequestAccess = (userId: string) => {
    setPendingRequests((prev) => ({ ...prev, [userId]: "PENDING" }));
    
    // Simulate automated approval after 2 seconds
    setTimeout(() => {
      setPendingRequests((prev) => ({ ...prev, [userId]: "APPROVED" }));
      setPrivateUnlocked((prev) => ({ ...prev, [userId]: true }));
    }, 2000);
  };

  // Send message handler
  const handleSendMessage = () => {
    if (!typedMessage.trim() || !activeChatUser) return;

    const userKey = activeChatUser.id;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: typedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => ({
      ...prev,
      [userKey]: [...(prev[userKey] || []), newMsg]
    }));
    setTypedMessage("");

    // Simulate partner typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = activeChatUser.replyTemplates || ["Díky za zprávu! 👍"];
      const responseText = responses[Math.floor(Math.random() * responses.length)];

      const partnerMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "partner",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages((prev) => ({
        ...prev,
        [userKey]: [...(prev[userKey] || []), partnerMsg]
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1A0A2E] text-white overflow-hidden relative">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#7B2FE7] opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#FF6B6B] opacity-15 blur-[100px] pointer-events-none" />

      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#7B2FE7]/20 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-[#7B2FE7] tracking-tighter">/A\</span>
          <span className="text-xl font-bold tracking-widest uppercase">ahoj</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#simulator" className="hidden md:inline text-sm font-semibold hover:text-[#FF6B6B] transition-colors">Web Preview</a>
          <button className="bg-[#7B2FE7] hover:bg-[#9B5AF0] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(123,47,231,0.4)] transition-all">
            Download App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7B2FE7]/15 border border-[#7B2FE7]/30 text-sm font-semibold text-[#FF6B6B] self-start">
            <Sparkles size={16} /> Proximity Social Network
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Meet people <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B]">
              in your circle.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-xl leading-relaxed">
            No algorithms, no swipe fatigue. Discover who is within walking distance by their 60-character icebreaker and ephemeral stories.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-95 shadow-lg transition-all flex items-center justify-center gap-2">
              <Smartphone size={20} /> Get Expo Go Preview
            </button>
            <a href="#simulator" className="border border-white/20 hover:bg-white/5 text-white px-8 py-4 rounded-full font-bold text-lg transition-all text-center flex items-center justify-center gap-2">
              <Compass size={20} /> Try Web Simulator
            </a>
          </div>
        </div>

        {/* Hero Interactive App Device Mockup */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-[320px] h-[640px] rounded-[48px] border-[8px] border-zinc-800 bg-[#240D40] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-4 overflow-hidden relative flex flex-col">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-full z-20" />

            {/* Simulated App Screen Header */}
            <div className="flex items-center justify-between pt-6 pb-4 border-b border-white/10 px-2">
              <span className="text-lg font-black text-[#7B2FE7]">/A\</span>
              <span className="text-sm font-bold">Nearby Feed</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>

            {/* Feed Items */}
            <div className="flex-1 overflow-y-auto pt-4 gap-4 flex flex-col">
              {MOCK_NEARBY_USERS.map((user) => {
                const isUserPrivate = user.privacyMode === "PRIVATE";
                const isUnlocked = privateUnlocked[user.id];
                return (
                  <div key={user.id} className="flex items-center gap-3 bg-[#2A1050] p-3 rounded-2xl border border-[#7B2FE7]/20">
                    <div className="relative">
                      {user.hasActiveStories && (
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#7B2FE7] to-[#FF6B6B] animate-pulse" />
                      )}
                      <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center font-bold text-sm border-2 border-[#2A1050] relative z-10`}>
                        {isUserPrivate && !isUnlocked ? "🔒" : user.initial}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-zinc-300">{user.username}</span>
                      <p className="text-[11px] text-zinc-400 truncate font-semibold">"{user.message}"</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold whitespace-nowrap">~{user.distanceMeters}m</span>
                  </div>
                );
              })}
            </div>

            {/* Simulated Tab Bar */}
            <div className="h-14 border-t border-white/10 flex items-center justify-around px-2 pt-2 bg-[#240D40]">
              <span className="text-xs text-[#7B2FE7] font-bold flex flex-col items-center">🌍 <span>Feed</span></span>
              <span className="text-xs text-zinc-400 font-bold flex flex-col items-center">💬 <span>Chat</span></span>
              <span className="text-xs text-zinc-400 font-bold flex flex-col items-center">👤 <span>Profile</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Simulator Section */}
      <section id="simulator" className="max-w-7xl mx-auto px-6 py-24 border-t border-[#7B2FE7]/20 relative z-10">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight">Interactive Proximity Simulator</h2>
          <p className="text-zinc-400 max-w-xl">
            Simulate your location. Tap on any nearby card to watch active stories, request private access, or start a real-time messaging simulation.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-4 bg-[#240D40] border border-[#7B2FE7]/30 p-6 rounded-3xl gap-6 flex flex-col">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Compass className="text-[#FF6B6B]" /> Simulator Controls
            </h3>

            {/* Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-zinc-400">Discovery Radius</span>
                <span className="text-[#7B2FE7]">{currentRadius} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={currentRadius}
                onChange={(e) => setCurrentRadius(parseFloat(e.target.value))}
                className="w-full accent-[#7B2FE7] cursor-pointer"
              />
            </div>

            {/* Active chat preview if selected */}
            {activeChatUser && (
              <div className="border border-[#7B2FE7]/30 bg-[#1A0A2E] rounded-2xl overflow-hidden flex flex-col h-[300px]">
                <div className="bg-[#2A1050] p-3 flex justify-between items-center border-b border-white/5">
                  <span className="font-bold text-xs">💬 Chat: @{activeChatUser.username}</span>
                  <button onClick={() => setActiveChatUser(null)} className="text-zinc-400 text-xs">✕ Close</button>
                </div>
                
                {/* Chat Message list */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                  {(chatMessages[activeChatUser.id] || []).map((msg) => (
                    <div key={msg.id} className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${
                      msg.sender === "me" 
                        ? "bg-[#7B2FE7] self-end rounded-tr-none text-white" 
                        : "bg-[#2A1050] self-start rounded-tl-none text-zinc-300"
                    }`}>
                      <p>{msg.text}</p>
                      <span className="text-[8px] text-white/40 block text-right mt-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-[#2A1050] text-zinc-400 max-w-[50px] p-2 rounded-2xl text-xs self-start italic animate-pulse">
                      ...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input row */}
                <div className="p-2 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#2A1050] rounded-full px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button onClick={handleSendMessage} className="bg-[#7B2FE7] p-1.5 rounded-full text-white">
                    <Send size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feed Preview */}
          <div className="lg:col-span-8 bg-[#2A1050]/40 border border-[#7B2FE7]/20 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-[#7B2FE7]" /> Nearby Users Feed (radius &le; {currentRadius}km)
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {MOCK_NEARBY_USERS.map((user) => {
                const distanceKm = user.distanceMeters / 1000;
                if (distanceKm > currentRadius) return null;

                const isUserPrivate = user.privacyMode === "PRIVATE";
                const isUnlocked = privateUnlocked[user.id];
                const requestStatus = pendingRequests[user.id] || "NONE";

                return (
                  <div
                    key={user.id}
                    className={`bg-[#2A1050] border border-[#7B2FE7]/30 p-5 rounded-3xl flex flex-col gap-4 relative transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.hasActiveStories && (
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] animate-pulse" />
                          )}
                          <div className={`w-12 h-12 rounded-full ${user.avatarColor} flex items-center justify-center font-extrabold text-lg border-2 border-[#2A1050] relative z-10`}>
                            {isUserPrivate && !isUnlocked ? "🔒" : user.initial}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-zinc-100 flex items-center gap-1.5">
                            {user.username}
                            {isUserPrivate && <span className="text-xs font-semibold text-zinc-500">🔒</span>}
                          </h4>
                          <span className="text-xs text-[#7B2FE7] font-semibold">~{user.distanceMeters} meters away</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A0A2E] p-3 rounded-2xl border border-white/5">
                      <p className="text-sm font-semibold italic text-zinc-300">"{user.message}"</p>
                    </div>

                    {/* Actions row */}
                    <div className="flex justify-end gap-2 mt-2">
                      {isUserPrivate && !isUnlocked ? (
                        <button
                          onClick={() => handleRequestAccess(user.id)}
                          className="bg-[#7B2FE7]/20 hover:bg-[#7B2FE7]/40 border border-[#7B2FE7] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                        >
                          {requestStatus === "PENDING" ? "Requested..." : "🔑 Request Access"}
                        </button>
                      ) : (
                        <>
                          {user.hasActiveStories && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setActiveStoryIdx(0);
                              }}
                              className="bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform"
                            >
                              ⚡ Watch Stories
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveChatUser(user);
                              if (!chatMessages[user.id]) {
                                setChatMessages((prev) => ({
                                  ...prev,
                                  [user.id]: [
                                    {
                                      id: "welcome",
                                      sender: "partner",
                                      text: `Ahoj! Napiš mi ohledně: "${user.message}"`,
                                      timestamp: "Now"
                                    }
                                  ]
                                }));
                              }
                            }}
                            className="bg-[#240D40] hover:bg-[#2A1050] border border-white/10 text-zinc-300 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                          >
                            💬 Chat
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-8 relative z-10">
        <div className="bg-[#240D40] border border-[#7B2FE7]/20 p-8 rounded-3xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7B2FE7]/10 flex items-center justify-center border border-[#7B2FE7]/20 text-[#7B2FE7]">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-xl font-bold">Zpráva jako návnada</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Každý uživatel má povinnou 60-znakovou zprávu, která slouží jako ledoborec. Zvyšuje zapojení a pomáhá navazovat reálná spojení.
          </p>
        </div>

        <div className="bg-[#240D40] border border-[#7B2FE7]/20 p-8 rounded-3xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center border border-[#FF6B6B]/20 text-[#FF6B6B]">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold">Privacy-First Design</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Granulární nastavení soukromí. Soukromé účty jsou ve feedu rozmazané a vyžadují schválení žádosti o přístup k obsahu.
          </p>
        </div>

        <div className="bg-[#240D40] border border-[#7B2FE7]/20 p-8 rounded-3xl flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
            <Flame size={24} />
          </div>
          <h3 className="text-xl font-bold">Ephemerální Stories</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Žádný stres z věčného obsahu. Stories mizí po 24 hodinách, takže sdílíte jen to, co děláte právě teď v reálném čase.
          </p>
        </div>
      </section>

      {/* Story Popup View */}
      {selectedUser && selectedUser.hasActiveStories && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-[420px] aspect-[9/16] bg-zinc-950 rounded-3xl overflow-hidden relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
              {selectedUser.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      width:
                        idx < activeStoryIdx
                          ? "100%"
                          : idx === activeStoryIdx
                          ? `${storyProgress}%`
                          : "0%"
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${selectedUser.avatarColor} flex items-center justify-center font-bold text-xs`}>
                  {selectedUser.initial}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white shadow-sm">{selectedUser.username}</h4>
                  <span className="text-[10px] text-zinc-300 font-semibold shadow-sm">~{selectedUser.distanceMeters}m away</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white hover:text-zinc-300 text-lg font-bold bg-black/40 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                ✕
              </button>
            </div>

            {/* Story Image */}
            <div className="flex-1 w-full h-full relative">
              <img
                src={selectedUser.stories[activeStoryIdx]}
                alt="Story content"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Story footer text */}
            <div className="absolute bottom-6 left-4 right-4 z-30 flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-sm font-semibold">"{selectedUser.message}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
