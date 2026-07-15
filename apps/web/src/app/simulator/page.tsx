"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, MessageSquare, Compass, Send } from "lucide-react";
import Navigation from "../../components/Navigation";
import { MOCK_NEARBY_USERS, Message } from "../../lib/mockData";

export default function SimulatorPage() {
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

  // New simulated features
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleToggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    if (val) {
      setPrivateUnlocked({ "1": true, "2": true, "3": true, "4": true });
      setPendingRequests({ "3": "APPROVED" });
      setChatMessages({
        "1": [
          { id: "d1", sender: "partner", text: "Ahoj! Zrovna balím batoh na víkend, plánuju Sněžku. Přidáš se? 🏔️", timestamp: "18:45" },
          { id: "d2", sender: "me", text: "Čau Natalie! To zní super, jdu do toho!", timestamp: "18:47" },
          { id: "d3", sender: "partner", text: "Pecka! Vyrážíme v sobotu ráno v 6:00 z Brna. Domluvíme se v autě?", timestamp: "18:48" },
          { id: "d4", sender: "me", text: "Jasně, naber mě prosím. Těším se!", timestamp: "18:50" }
        ],
        "2": [
          { id: "d5", sender: "partner", text: "Ahoj! Zrovna sedím v kavárně za rohem. Mají tu skvělou Keňu, stav se! ☕", timestamp: "19:02" },
          { id: "d6", sender: "me", text: "Čau Kubajz, za 10 minut jsem tam!", timestamp: "19:05" },
          { id: "d7", sender: "partner", text: "Super, držím ti stůl!", timestamp: "19:06" }
        ]
      });
      setToastMessage("Demo režim aktivován! Všechny profily odemčeny a konverzace načteny. 🚀");
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setPrivateUnlocked({});
      setPendingRequests({});
      setChatMessages({});
      setToastMessage("Demo režim vypnut. Můžete testovat interaktivní průběh.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChatUser, isTyping]);

  // Story autoplay effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedUser && selectedUser.hasActiveStories && selectedUser.stories.length > 0) {
      setTimeout(() => setStoryProgress(0), 0);
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
      const user = MOCK_NEARBY_USERS.find(u => u.id === userId);
      if (user) {
        setToastMessage(`Uživatel @${user.username} schválil tvou žádost o přístup! 🔓`);
        setTimeout(() => setToastMessage(null), 4000);
      }
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
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [userKey]: [...(prev[userKey] || []), newMsg],
    }));
    setTypedMessage("");

    // Simulate reply after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = activeChatUser.replyTemplates || ["Ahoj! 😊", "Jak se máš?"];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "partner",
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => ({
        ...prev,
        [userKey]: [...(prev[userKey] || []), replyMsg],
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1A0A2E] text-white relative pb-16">
      {/* Background neons */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#7B2FE7] rounded-full blur-[150px] opacity-15 pointer-events-none" />

      {/* Global Navigation */}
      <Navigation />

      {/* Main Grid content */}
      <main className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-[#7B2FE7] bg-clip-text text-transparent">
            Interaktivní Proximity Simulátor
          </h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            Otestuj si chování proximity sítě ahoj přímo ve svém prohlížeči.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls & Radar */}
          <div className="lg:col-span-4 bg-[#240D40] border border-[#7B2FE7]/30 p-6 rounded-3xl gap-6 flex flex-col">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Compass className="text-[#FF6B6B]" /> Ovládání simulátoru
            </h3>

            {/* Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-zinc-400">Dosah vyhledávání</span>
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

            {/* Demo Mode Toggle */}
            <div className="flex justify-between items-center bg-[#1A0A2E] p-3 rounded-2xl border border-[#FF6B6B]/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold flex items-center gap-1">🚀 Demo Režim</span>
                <span className="text-[10px] text-zinc-400">Načte kompletní data a chaty</span>
              </div>
              <button
                onClick={() => handleToggleDemoMode(!isDemoMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  isDemoMode ? "bg-[#7B2FE7]" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isDemoMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Ghost Mode Toggle */}
            <div className="flex justify-between items-center bg-[#1A0A2E] p-3 rounded-2xl border border-[#7B2FE7]/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold flex items-center gap-1">👻 Ghost Mode</span>
                <span className="text-[10px] text-zinc-400">Skryje tě na mapě a feedu</span>
              </div>
              <button
                onClick={() => setIsGhostMode(!isGhostMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  isGhostMode ? "bg-[#FF6B6B]" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isGhostMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Proximity Radar Map */}
            <div className="flex flex-col gap-3 items-center">
              <span className="text-xs font-semibold text-zinc-400 self-start">Radar blízkosti</span>
              <div className="w-[240px] h-[240px] rounded-full bg-[#1A0A2E] border border-[#7B2FE7]/40 relative overflow-hidden flex items-center justify-center shadow-inner">
                {/* Radar grid circles */}
                <div className="absolute w-[180px] h-[180px] rounded-full border border-[#7B2FE7]/10" />
                <div className="absolute w-[120px] h-[120px] rounded-full border border-[#7B2FE7]/15" />
                <div className="absolute w-[60px] h-[60px] rounded-full border border-[#7B2FE7]/20" />
                
                {/* Radar sweeping scan animation line */}
                <div className="absolute inset-0 rounded-full border border-[#7B2FE7]/30 bg-gradient-to-r from-transparent to-[#7B2FE7]/10 origin-center animate-[spin_5s_linear_infinite] pointer-events-none" />

                {/* Central Dot (Me) */}
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] border border-white/40 flex items-center justify-center z-20 shadow-md">
                  <span className="text-[8px]">{isGhostMode ? "👻" : "👤"}</span>
                </div>
                {isGhostMode && (
                  <div className="absolute w-8 h-8 rounded-full border border-[#FF6B6B]/40 animate-ping z-10 pointer-events-none" />
                )}

                {/* Blips of other users */}
                {MOCK_NEARBY_USERS.map((user) => {
                  const distanceKm = user.distanceMeters / 1000;
                  const isVisible = distanceKm <= currentRadius;
                  
                  // Coordinate calculation
                  const angles: Record<string, number> = {
                    "1": 30 * (Math.PI / 180),   // Natalie
                    "2": 120 * (Math.PI / 180),  // Kubajz
                    "3": 220 * (Math.PI / 180),  // Secret Vibe
                    "4": 310 * (Math.PI / 180)   // Emma Art
                  };
                  
                  const angle = angles[user.id] || 0;
                  const maxRadarMeters = currentRadius * 1000;
                  const ratio = Math.min(1.0, user.distanceMeters / maxRadarMeters);
                  
                  // Position relative to center (120, 120) with radius 100
                  const blipRadius = 100;
                  const x = 120 + blipRadius * ratio * Math.cos(angle);
                  const y = 120 + blipRadius * ratio * Math.sin(angle);
                  
                  const isUserPrivate = user.privacyMode === "PRIVATE";
                  const isUnlocked = privateUnlocked[user.id];

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (!isUserPrivate || isUnlocked) {
                          if (user.hasActiveStories) {
                            setSelectedUser(user);
                            setActiveStoryIdx(0);
                          } else {
                            setActiveChatUser(user);
                          }
                        } else {
                          handleRequestAccess(user.id);
                        }
                      }}
                      className={`absolute w-8 h-8 rounded-full border-2 bg-zinc-900 border-[#2A1050] flex items-center justify-center overflow-hidden transition-all duration-500 z-30 group shadow-md ${
                        isVisible ? "opacity-100 scale-100" : "opacity-25 scale-75 cursor-not-allowed pointer-events-none"
                      }`}
                      style={{
                        left: `${x - 16}px`,
                        top: `${y - 16}px`,
                      }}
                      title={`@${user.username} (${user.distanceMeters}m)`}
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className={`w-full h-full object-cover transition-all ${
                          isUserPrivate && !isUnlocked ? "blur-sm opacity-35 grayscale" : ""
                        }`}
                      />
                      {isUserPrivate && !isUnlocked && (
                        <span className="absolute text-[8px] bg-black/60 px-1 py-0.5 rounded text-white font-bold">🔒</span>
                      )}
                      
                      {/* Tooltip */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#240D40] text-[9px] font-bold text-white rounded border border-[#7B2FE7]/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-40">
                        @{user.username} ({user.distanceMeters}m)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active chat preview if selected */}
            {activeChatUser && (
              <div className="border border-[#7B2FE7]/30 bg-[#1A0A2E] rounded-2xl overflow-hidden flex flex-col h-[300px]">
                <div className="bg-[#2A1050] p-3 flex justify-between items-center border-b border-white/5">
                  <span className="font-bold text-xs">💬 Chat s @{activeChatUser.username}</span>
                  <button onClick={() => setActiveChatUser(null)} className="text-xs text-zinc-400 hover:text-white">Zavřít</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 gap-2 flex flex-col">
                  {(chatMessages[activeChatUser.id] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[80%] p-2.5 rounded-2xl text-xs ${
                        msg.sender === "me"
                          ? "bg-[#7B2FE7] self-end rounded-tr-none text-white"
                          : "bg-[#2A1050] self-start rounded-tl-none text-zinc-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-zinc-400 block text-right mt-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-[#2A1050] self-start rounded-2xl rounded-tl-none p-2 max-w-[80%]">
                      <span className="text-[10px] text-zinc-400 animate-pulse">Píše...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-2 bg-[#2A1050] border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Napiš zprávu..."
                    className="flex-1 bg-[#1A0A2E] text-xs border border-white/10 rounded-full px-3 py-2 text-white focus:outline-none focus:border-[#7B2FE7]"
                  />
                  <button onClick={handleSendMessage} className="w-8 h-8 rounded-full bg-[#7B2FE7] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all">
                    <Send size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Feed Preview */}
          <div className="lg:col-span-8 bg-[#2A1050]/40 border border-[#7B2FE7]/20 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-[#7B2FE7]" /> Lidé v dosahu (&le; {currentRadius} km)
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
                    className="bg-[#2A1050] border border-[#7B2FE7]/30 p-5 rounded-3xl flex flex-col gap-4 relative transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.hasActiveStories && (
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] animate-pulse" />
                          )}
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2A1050] relative z-10 flex items-center justify-center bg-zinc-900 shadow-inner">
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className={`w-full h-full object-cover transition-all duration-500 ${
                                isUserPrivate && !isUnlocked ? "blur-md opacity-40 grayscale" : ""
                              }`}
                            />
                            {isUserPrivate && !isUnlocked && (
                              <span className="absolute text-xs z-20">🔒</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-zinc-100 flex items-center gap-1.5">
                            @{user.username}
                            {isUserPrivate && <span className="text-xs font-semibold text-zinc-500">🔒</span>}
                          </h4>
                          <span className="text-xs text-[#7B2FE7] font-semibold">~{user.distanceMeters} metrů od tebe</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A0A2E] p-3 rounded-2xl border border-white/5">
                      <p className="text-sm font-semibold italic text-zinc-300">&ldquo;{user.message}&rdquo;</p>
                    </div>

                    {/* Actions row */}
                    <div className="flex justify-end gap-2 mt-2">
                      {isUserPrivate && !isUnlocked ? (
                        <button
                          onClick={() => handleRequestAccess(user.id)}
                          className="bg-[#7B2FE7]/20 hover:bg-[#7B2FE7]/40 border border-[#7B2FE7] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                        >
                          {requestStatus === "PENDING" ? "Odesláno..." : "🔑 Požádat o přístup"}
                        </button>
                      ) : (
                        <>
                          {user.hasActiveStories && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setActiveStoryIdx(0);
                              }}
                              className="bg-gradient-to-r from-[#7B2FE7] to-[#FF6B6B] hover:opacity-90 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md"
                            >
                              🎬 Zobrazit Příběh
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveChatUser(user);
                              // Auto scroll to chat
                            }}
                            className="bg-[#240D40] border border-[#7B2FE7]/30 hover:bg-[#2A1050]/60 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                          >
                            💬 Poslat zprávu
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
      </main>

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

            {/* Story Header */}
            <div className="absolute top-8 left-4 right-4 z-30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.username}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover"
                />
                <span className="text-white text-xs font-bold shadow-sm">@{selectedUser.username}</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-black shadow-sm"
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
                <p className="text-sm font-semibold">&ldquo;{selectedUser.message}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1050] border border-[#7B2FE7] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-[slideIn_0.3s_ease-out]">
          <span className="text-sm font-bold text-zinc-100">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
