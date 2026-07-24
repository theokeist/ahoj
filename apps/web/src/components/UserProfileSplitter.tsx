"use client";

import React, { useState } from "react";
import { Splitter } from "antd";
import {
  User,
  MapPin,
  Flame,
  MessageSquare,
  Sparkles,
  Camera,
  Share2,
  Lock,
  Plus,
  X,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Calendar,
  Zap,
  Globe,
  Sliders,
  Heart,
  Eye,
} from "lucide-react";

export interface UserProfileData {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  message: string;
  bio?: string;
  avatarUrl: string;
  privacyMode: "PUBLIC" | "GHOST" | "PRIVATE";
  distanceMeters?: number;
  lastActive?: string;
  locationName?: string;
  photoAlbum?: string[];
  sparks?: Array<{
    id: string;
    title: string;
    category: string;
    distanceMeters: number;
    description?: string;
  }>;
  plusOneCount?: number;
  interests?: string[];
  oauthProvider?: "google" | "github" | "spotify" | "twitter" | "apple";
  oauthProviderLabel?: string;
  oauthScopes?: string[];
  verifiedOAuth?: boolean;
  bannerUrl?: string;
}

interface UserProfileSplitterProps {
  user: UserProfileData;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onStartChat?: (user: UserProfileData) => void;
  onUploadPhoto?: () => void;
}

export function UserProfileSplitter({
  user,
  isOwnProfile = false,
  onEditProfile,
  onStartChat,
  onUploadPhoto,
}: UserProfileSplitterProps) {
  // Splitter panel sizes state (percentage) - Golden Ratio Default (61.8% top, 38.2% bottom)
  const [topPanelPercent, setTopPanelPercent] = useState<number>(61.8);
  const [plusOnes, setPlusOnes] = useState({
    count: user.plusOneCount ?? 28,
    clicked: false,
  });

  // Lightbox State for Gallery Photos
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState<"all" | "stories" | "sparks">("all");

  const togglePlusOne = () => {
    setPlusOnes((prev) => ({
      count: prev.clicked ? prev.count - 1 : prev.count + 1,
      clicked: !prev.clicked,
    }));
  };

  const defaultPhotoAlbum = [
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
  ];

  const galleryPhotos = user.photoAlbum && user.photoAlbum.length > 0 ? user.photoAlbum : defaultPhotoAlbum;

  const defaultSparks = [
    {
      id: "spk-1",
      title: "Spontaneous 3v3 Basketball 🏀",
      category: "SPORTS",
      distanceMeters: 450,
      description: "Looking for 2 players at Kraví Hora courts! High energy friendly match.",
    },
    {
      id: "spk-2",
      title: "Specialty Coffee & Tech Chat ☕",
      category: "COFFEE",
      distanceMeters: 320,
      description: "Hanging out at Skog Urban Hub for 2 hours working on React & Rust.",
    },
  ];

  const userSparks = user.sparks || defaultSparks;

  const interestsList = user.interests || [
    "☕ Specialty Coffee",
    "🏀 Basketball",
    "🎧 Synthwave & Techno",
    "🏔️ Hiking & Camping",
    "💻 React & TypeScript",
    "⚡ Impromptu Meetups",
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#0C0C0C] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      {/* ── Ant Design Resizable Vertical Splitter ───────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        <Splitter
          layout="vertical"
          style={{ height: "100%", width: "100%" }}
          onResize={(sizes) => {
            if (sizes && sizes.length > 0 && typeof sizes[0] === "number") {
              setTopPanelPercent(sizes[0]);
            }
          }}
        >
          {/* ════ TOP PART: AVATAR & SIMPLE BIO ════════════════════════════ */}
          <Splitter.Panel
            defaultSize={`${topPanelPercent}%`}
            min="18%"
            max="75%"
            collapsible={{ start: true, end: false }}
            style={{
              overflowY: "auto",
              backgroundColor: "#0C0C0C",
            }}
          >
            <div className="p-4 sm:p-6 bg-[#0C0C0C]">
              {/* ── Narrow, Modern Centered Column (max-w-2xl) ── */}
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Sleek Ambient Header Banner */}
                <div className="relative h-28 rounded-2xl bg-gradient-to-r from-[#00F2FE]/20 via-purple-500/15 to-[#FF6B6B]/15 border border-white/10 overflow-hidden">
                  {user.bannerUrl ? (
                    <img src={user.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,242,254,0.15),transparent_60%)]" />
                  )}
                </div>

                {/* User Header & Avatar Row (Overlapping Cover) */}
                <div className="relative -mt-12 px-2 flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300"}
                      alt={user.username}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-4 border-[#0C0C0C] bg-[#121212] shadow-xl"
                    />
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={onUploadPhoto}
                        className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-150 cursor-pointer"
                        title="Change Avatar"
                      >
                        <Camera size={18} className="text-[#00F2FE]" />
                        <span className="text-[10px] font-bold mt-0.5">Edit</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1 sm:pt-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-white tracking-tight">
                        {user.fullName || `@${user.username}`}
                      </h2>
                      <span className="text-[#00F2FE] text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                      {user.oauthProviderLabel && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 text-[10px] font-bold font-mono">
                          {user.oauthProviderLabel}
                        </span>
                      )}
                      {user.privacyMode === "PRIVATE" && (
                        <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                          <Lock size={12} /> Private
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 font-medium">
                      <span className="text-[#00F2FE] font-bold flex items-center gap-1">
                        <MapPin size={13} /> {user.locationName || "Brno Center"} (~{user.distanceMeters ?? 320}m)
                      </span>
                      <span>·</span>
                      <span className="text-white/40">Active {user.lastActive || "2m ago"}</span>
                    </div>

                    {/* Icebreaker */}
                    <div className="flex items-center gap-2 text-xs text-white pt-1">
                      <Zap size={14} className="text-[#00F2FE] shrink-0" />
                      <span className="text-white/85 italic font-normal text-xs">&ldquo;{user.message}&rdquo;</span>
                    </div>
                  </div>
                </div>

                {/* Seamless Bio & Interests Flow (No separate cards or headers) */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {user.bio ||
                      "Specialty coffee brewing ☕, impromptu basketball games in Brno 🏀, and synthwave beats 🎧. Always up for spontaneous coffee meetups or coding discussions!"}
                  </p>

                  <div className="text-xs text-white/70 font-medium leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                    {interestsList.map((interest, idx) => (
                      <React.Fragment key={idx}>
                        <span className="hover:text-[#00F2FE] transition-colors cursor-default">{interest}</span>
                        {idx < interestsList.length - 1 && <span className="text-white/20 select-none">•</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Single Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2.5">
                    {!isOwnProfile ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartChat?.(user)}
                          className="px-5 py-2.5 rounded-2xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.25)] transition-all cursor-pointer"
                        >
                          <MessageSquare size={15} /> Direct Message
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
                        >
                          <Flame size={15} className="text-[#FF6B6B]" /> Invite to Spark
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={onEditProfile}
                        className="px-5 py-2.5 rounded-2xl bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.25)] transition-all cursor-pointer"
                      >
                        <Sliders size={15} /> Edit Profile & Settings
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlusOne}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        plusOnes.clicked
                          ? "bg-[#00F2FE] text-black font-black"
                          : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span>+1</span>
                      <Heart size={13} className={plusOnes.clicked ? "fill-black" : ""} />
                      <span className="font-mono text-[11px] ml-0.5">{plusOnes.count}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert("Profile link copied to clipboard!")}
                      className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 size={13} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Splitter.Panel>

          {/* ════ BOTTOM PART: GALLERY & PUBLIC STREAM ═════════════════ */}
          <Splitter.Panel
            defaultSize={`${100 - topPanelPercent}%`}
            min="25%"
            collapsible={{ start: false, end: true }}
            style={{
              overflowY: "auto",
              backgroundColor: "#0C0C0C",
            }}
          >
            <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
              {/* Seamless Gallery Stream (Zero nested card boxes) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Photo Gallery ({galleryPhotos.length})
                  </span>

                  <div className="flex items-center gap-1.5">
                    {(["all", "stories", "sparks"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveGalleryTab(tab)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                          activeGalleryTab === tab
                            ? "bg-[#00F2FE] text-black shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {tab === "all" ? "All" : tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={onUploadPhoto}
                      className="h-36 sm:h-40 rounded-2xl border-2 border-dashed border-[#00F2FE]/40 bg-[#00F2FE]/5 hover:bg-[#00F2FE]/10 flex flex-col items-center justify-center text-[#00F2FE] transition-all group cursor-pointer"
                    >
                      <Plus size={24} className="group-hover:scale-125 transition-transform" />
                      <span className="text-xs font-bold mt-1">Upload Photo</span>
                    </button>
                  )}

                  {galleryPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhoto(photoUrl)}
                      className="relative h-36 sm:h-40 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer bg-white/5"
                    >
                      <img
                        src={photoUrl}
                        alt={`Gallery photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <div className="flex items-center justify-between text-[10px] text-white font-semibold">
                          <span className="flex items-center gap-1">
                            <Eye size={12} className="text-[#00F2FE]" /> View HD
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/60 text-[#00F2FE]">
                            +1 {12 + idx * 3}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seamless Public Sparks Stream */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame size={15} className="text-[#FF6B6B]" /> Recent Sparks
                  </span>
                  <span className="text-[10px] font-bold text-white/50">{userSparks.length} Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userSparks.map((spark) => (
                    <div
                      key={spark.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 hover:border-[#00F2FE]/30 transition-all"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#00F2FE]">
                          {spark.category}
                        </span>
                        <span className="text-white/50 font-mono">~{spark.distanceMeters}m away</span>
                      </div>
                      <h4 className="font-bold text-xs text-white">{spark.title}</h4>
                      <p className="text-[11px] text-white/60 line-clamp-2">{spark.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* ── Photo Lightbox Modal ────────────────────────────────────────── */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-20"
            >
              <X size={20} />
            </button>
            <img src={activePhoto} alt="Enlarged gallery view" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
