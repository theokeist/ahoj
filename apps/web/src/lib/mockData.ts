export const MOCK_NEARBY_USERS = [
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
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    initial: "E",
    replyTemplates: [
      "Ahoj! Kreslím zrovna stromy v parku pod hradem, vezmi si skicák a přijď! 🎨",
      "Používám hlavně uhel a akvarel. Zkoušíš taky?"
    ]
  },
  // ── OAuth Platform Demo Accounts ───────────────────────────────────────────────
  {
    id: "oauth-google-1",
    username: "alex_google",
    message: "Building spatial AI & cloud apps ☁️",
    distanceMeters: 180,
    hasActiveStories: true,
    stories: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600"
    ],
    bio: "Google Workspace Engineer | Tech, Specialty Coffee & Cloud Architecture ☕☁️",
    privacyMode: "PUBLIC",
    avatarColor: "bg-blue-600",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    initial: "A",
    oauthProvider: "google",
    oauthProviderLabel: "Google Auth 🔵",
    oauthScopes: ["email", "profile", "openid"],
    verifiedOAuth: true,
    replyTemplates: [
      "Hey! Signed in via Google OAuth. Working on web components & AI integrations today! 🚀",
      "Always up for coffee & cloud talk!"
    ]
  },
  {
    id: "oauth-github-2",
    username: "dev_github",
    message: "Shipping open source & Rust tools 🦀",
    distanceMeters: 310,
    hasActiveStories: true,
    stories: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600"
    ],
    bio: "Core contributor @ React & Rust crates. Hacking on local P2P mesh networking. 💻",
    privacyMode: "PUBLIC",
    avatarColor: "bg-gray-800",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    bannerUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200",
    initial: "D",
    oauthProvider: "github",
    oauthProviderLabel: "GitHub Auth 🐙",
    oauthScopes: ["read:user", "user:email"],
    verifiedOAuth: true,
    replyTemplates: [
      "Hey there! Connected via GitHub OAuth. Check out my latest repos when you have time! 🐙",
      "Building fast code & drinking espresso."
    ]
  },
  {
    id: "oauth-spotify-3",
    username: "music_spotify",
    message: "Curating indie electronic playlists 🎧",
    distanceMeters: 520,
    hasActiveStories: true,
    stories: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600"
    ],
    bio: "Audio Engineer & Spotify Curator. Currently listening to synthwave & ambient 🎹",
    privacyMode: "PUBLIC",
    avatarColor: "bg-emerald-600",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
    initial: "M",
    oauthProvider: "spotify",
    oauthProviderLabel: "Spotify Auth 🟢",
    oauthScopes: ["user-read-currently-playing", "playlist-read-private"],
    verifiedOAuth: true,
    replyTemplates: [
      "Hey! Spotify OAuth connected. Sending vibes and track recommendations! 🎧",
      "What album are you on today?"
    ]
  },
  {
    id: "oauth-twitter-4",
    username: "creator_twitter",
    message: "Designing UI micro-interactions 🎨",
    distanceMeters: 640,
    hasActiveStories: false,
    stories: [],
    bio: "X Tech Creator & Design Systems Architect. Sharing daily UI tricks & glassmorphism tips. 🖤",
    privacyMode: "PUBLIC",
    avatarColor: "bg-slate-700",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150&h=150",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200",
    initial: "S",
    oauthProvider: "twitter",
    oauthProviderLabel: "X / Twitter Auth ✖️",
    oauthScopes: ["users.read", "tweet.read"],
    verifiedOAuth: true,
    replyTemplates: [
      "Hi! Signed in with X / Twitter OAuth. Loving the design system here! ✨",
      "Let's connect on design and tech."
    ]
  }
];

export type Message = {
  id: string;
  sender: "me" | "partner";
  text: string;
  timestamp: string;
};
