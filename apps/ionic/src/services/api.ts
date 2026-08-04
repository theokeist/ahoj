// API Service with mock fallback for Ahoj Ionic Proximity Social Network

export type PrivacyMode = 'PUBLIC' | 'PRIVATE' | 'GHOST';

export interface UserPublic {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
  statusMessage: string;
  privacyMode: PrivacyMode;
  distanceMeters: number;
  hasActiveStories: boolean;
  lastActive: string;
  lat: number;
  lng: number;
  interests: string[];
  isVerified?: boolean;
  accessStatus?: 'PENDING' | 'APPROVED' | 'DENIED' | null;
}

export interface SparkPublic {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl: string;
  title: string;
  description: string;
  category: 'COFFEE' | 'SPORTS' | 'PARTY' | 'STUDY' | 'MEETUP' | 'OTHER';
  distanceMeters: number;
  createdAt: string;
  expiresAt: string;
  participantsCount?: number;
  isJoined?: boolean;
}

export interface StoryPublic {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl: string;
  mediaUrl: string;
  caption: string;
  createdAt: string;
  locationName?: string;
  viewsCount?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isMe: boolean;
  mediaUrl?: string;
}

export interface ChatItem {
  id: string;
  user: UserPublic;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface LoungePublic {
  id: string;
  title: string;
  venueName: string;
  category: 'AUDIO' | 'CHAT' | 'MUSIC' | 'GAMING' | 'TECH';
  distanceMeters: number;
  speakerCount: number;
  listenerCount: number;
  activeSpeakers: { id: string; name: string; avatarUrl: string; isSpeaking?: boolean }[];
  description: string;
  isLocked?: boolean;
}

export interface FlashDealPublic {
  id: string;
  businessName: string;
  avatarUrl: string;
  title: string;
  discountText: string;
  code: string;
  distanceMeters: number;
  expiresInMinutes: number;
  category: string;
  terms: string;
  isClaimed?: boolean;
}

export interface AccessRequestItem {
  id: string;
  user: UserPublic;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
}

export interface SafeZoneItem {
  id: string;
  name: string;
  radiusMeters: number;
  fuzzLevel: 'APPROXIMATE' | 'INVISIBLE' | 'GHOST';
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'PROXIMITY' | 'ACCESS' | 'SPARK' | 'STORY' | 'LOUNGE';
  title: string;
  subtitle: string;
  timestamp: string;
  read: boolean;
  avatarUrl?: string;
}

// Initial Rich Mock Data
export const MOCK_USERS: UserPublic[] = [
  {
    id: 'u-1',
    username: 'alex_cyber',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Tech enthusiast, barista & coffee runner ☕️',
    statusMessage: 'Grinding at Bitcoin Coffee ☕️',
    privacyMode: 'PUBLIC',
    distanceMeters: 140,
    hasActiveStories: true,
    lastActive: 'Just now',
    lat: 50.0875,
    lng: 14.4214,
    interests: ['coffee', 'crypto', 'startups', 'tech'],
    isVerified: true,
    accessStatus: 'APPROVED'
  },
  {
    id: 'u-2',
    username: 'elena_v',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'UI Designer & Night Photography 📸',
    statusMessage: 'Looking for a study buddy 📚',
    privacyMode: 'PUBLIC',
    distanceMeters: 380,
    hasActiveStories: true,
    lastActive: '5m ago',
    lat: 50.0882,
    lng: 14.4230,
    interests: ['design', 'photography', 'art', 'reading'],
    isVerified: true,
    accessStatus: null
  },
  {
    id: 'u-3',
    username: 'ghost_runner_99',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Anonymity is power 👻',
    statusMessage: 'In ghost mode near Stromovka 🌲',
    privacyMode: 'GHOST',
    distanceMeters: 720,
    hasActiveStories: false,
    lastActive: '12m ago',
    lat: 50.0890,
    lng: 14.4250,
    interests: ['privacy', 'running', 'cyberpunk'],
    isVerified: false,
    accessStatus: 'PENDING'
  },
  {
    id: 'u-4',
    username: 'sophia_code',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Fullstack Dev & Bouldering addict 🧗‍♀️',
    statusMessage: 'Anyone up for bouldering at 6PM? 🧗',
    privacyMode: 'PUBLIC',
    distanceMeters: 1100,
    hasActiveStories: true,
    lastActive: '2m ago',
    lat: 50.0850,
    lng: 14.4180,
    interests: ['bouldering', 'code', 'react', 'outdoors'],
    isVerified: true,
    accessStatus: null
  },
  {
    id: 'u-5',
    username: 'marcus_vibe',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Sound designer & Synth lover 🎹',
    statusMessage: 'Jamming rooftop beat session 🎧',
    privacyMode: 'PRIVATE',
    distanceMeters: 1850,
    hasActiveStories: false,
    lastActive: '1h ago',
    lat: 50.0830,
    lng: 14.4290,
    interests: ['music', 'synth', 'dj', 'audio'],
    isVerified: false,
    accessStatus: null
  },
  {
    id: 'u-6',
    username: 'tomas_prague',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Local guide & Craft beer lover 🍺',
    statusMessage: 'Chilling at Letná Beer Garden 🍺',
    privacyMode: 'PUBLIC',
    distanceMeters: 450,
    hasActiveStories: true,
    lastActive: '15m ago',
    lat: 50.0910,
    lng: 14.4220,
    interests: ['beer', 'prague', 'foodie', 'events'],
    isVerified: true,
    accessStatus: null
  }
];

export const MOCK_SPARKS: SparkPublic[] = [
  {
    id: 's-1',
    userId: 'u-1',
    username: 'alex_cyber',
    userAvatarUrl: MOCK_USERS[0].avatarUrl,
    title: 'Espresso & Startup Chat',
    description: 'Meeting at Cafefin in 15 mins. First round on me!',
    category: 'COFFEE',
    distanceMeters: 140,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 105 * 60000).toISOString(),
    participantsCount: 3,
    isJoined: true
  },
  {
    id: 's-2',
    userId: 'u-4',
    username: 'sophia_code',
    userAvatarUrl: MOCK_USERS[3].avatarUrl,
    title: '5km Sunset River Run',
    description: 'Meeting by the Naplavka embankment. Casual 5:30/km pace.',
    category: 'SPORTS',
    distanceMeters: 1100,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 80 * 60000).toISOString(),
    participantsCount: 5,
    isJoined: false
  },
  {
    id: 's-3',
    userId: 'u-5',
    username: 'marcus_vibe',
    userAvatarUrl: MOCK_USERS[4].avatarUrl,
    title: 'Electronic Jam Session',
    description: 'Modular synth lovers welcome. Rooftop terrace view.',
    category: 'PARTY',
    distanceMeters: 1850,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 115 * 60000).toISOString(),
    participantsCount: 2,
    isJoined: false
  },
  {
    id: 's-4',
    userId: 'u-6',
    username: 'tomas_prague',
    title: 'Sunset Beer & Table Tennis',
    description: 'Grab a drink and play ping pong at Letná Park!',
    category: 'MEETUP',
    userAvatarUrl: MOCK_USERS[5].avatarUrl,
    distanceMeters: 450,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 140 * 60000).toISOString(),
    participantsCount: 8,
    isJoined: false
  }
];

export const MOCK_STORIES: StoryPublic[] = [
  {
    id: 'st-1',
    userId: 'u-1',
    username: 'alex_cyber',
    userAvatarUrl: MOCK_USERS[0].avatarUrl,
    mediaUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    caption: 'Fresh morning brew at Vnitroblock! ☕✨',
    createdAt: '1h ago',
    locationName: 'Vnitroblock, Holesovice',
    viewsCount: 42
  },
  {
    id: 'st-2',
    userId: 'u-2',
    username: 'elena_v',
    userAvatarUrl: MOCK_USERS[1].avatarUrl,
    mediaUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    caption: 'Prague night lights from Letná tower 🏙️',
    createdAt: '3h ago',
    locationName: 'Letná Park',
    viewsCount: 89
  },
  {
    id: 'st-3',
    userId: 'u-4',
    username: 'sophia_code',
    userAvatarUrl: MOCK_USERS[3].avatarUrl,
    mediaUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&auto=format&fit=crop&q=80',
    caption: 'New V6 route flashed! 🧗‍♀️🔥',
    createdAt: '5h ago',
    locationName: 'SmichOff Climbing',
    viewsCount: 65
  },
  {
    id: 'st-4',
    userId: 'u-6',
    username: 'tomas_prague',
    userAvatarUrl: MOCK_USERS[5].avatarUrl,
    mediaUrl: 'https://images.unsplash.com/photo-1538488881523-434905ce4303?w=600&auto=format&fit=crop&q=80',
    caption: 'Golden hour sunset over Charles Bridge 🌅',
    createdAt: '30m ago',
    locationName: 'Charles Bridge',
    viewsCount: 118
  }
];

export const MOCK_LOUNGES: LoungePublic[] = [
  {
    id: 'l-1',
    title: 'Bitcoin Coffee Dev Lounge ☕️',
    venueName: 'Paralelni Polis / Bitcoin Coffee',
    category: 'TECH',
    distanceMeters: 140,
    speakerCount: 4,
    listenerCount: 18,
    activeSpeakers: [
      { id: 'u-1', name: 'alex_cyber', avatarUrl: MOCK_USERS[0].avatarUrl, isSpeaking: true },
      { id: 'u-4', name: 'sophia_code', avatarUrl: MOCK_USERS[3].avatarUrl, isSpeaking: false },
      { id: 'me-100', name: 'martasko14', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', isSpeaking: false }
    ],
    description: 'Live spatial voice room for local builders, founders & coffee lovers.'
  },
  {
    id: 'l-2',
    title: 'Letná Sunset Beats & Ambient Chill 🎧',
    venueName: 'Letná Park Viewpoint',
    category: 'MUSIC',
    distanceMeters: 450,
    speakerCount: 2,
    listenerCount: 35,
    activeSpeakers: [
      { id: 'u-5', name: 'marcus_vibe', avatarUrl: MOCK_USERS[4].avatarUrl, isSpeaking: true },
      { id: 'u-6', name: 'tomas_prague', avatarUrl: MOCK_USERS[5].avatarUrl, isSpeaking: false }
    ],
    description: 'Listen live to modular synth sessions streaming from the park.'
  },
  {
    id: 'l-3',
    title: 'CTU University Tech Talk Hub 🎓',
    venueName: 'Czech Technical University Campus',
    category: 'AUDIO',
    distanceMeters: 920,
    speakerCount: 3,
    listenerCount: 12,
    activeSpeakers: [
      { id: 'u-2', name: 'elena_v', avatarUrl: MOCK_USERS[1].avatarUrl, isSpeaking: true }
    ],
    description: 'Discussing AI agents, Vite, and mobile proximity networks.'
  }
];

export const MOCK_DEALS: FlashDealPublic[] = [
  {
    id: 'd-1',
    businessName: 'Bitcoin Coffee',
    avatarUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
    title: '2-for-1 Speciality Flat White',
    discountText: '50% OFF',
    code: 'AHOJ-COFFEE-24',
    distanceMeters: 140,
    expiresInMinutes: 45,
    category: 'Coffee & Snacks',
    terms: 'Show QR code to barista. Valid for nearby users within 300m.'
  },
  {
    id: 'd-2',
    businessName: 'SmichOff Bouldering Center',
    avatarUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=150&auto=format&fit=crop&q=80',
    title: '20% Off Evening Pass + Free Shoes Rental',
    discountText: '20% OFF',
    code: 'CLIMB-AHOJ-20',
    distanceMeters: 1100,
    expiresInMinutes: 90,
    category: 'Sports & Fitness',
    terms: 'Valid today only. Present code at entrance desk.'
  }
];

export const MOCK_ACCESS_REQUESTS: AccessRequestItem[] = [
  {
    id: 'ar-1',
    user: MOCK_USERS[2], // ghost_runner_99
    createdAt: '10m ago',
    status: 'PENDING'
  },
  {
    id: 'ar-2',
    user: MOCK_USERS[4], // marcus_vibe
    createdAt: '1h ago',
    status: 'PENDING'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'PROXIMITY',
    title: 'Proximity Alert ⚡️',
    subtitle: 'alex_cyber is now 140 meters away from you',
    timestamp: 'Just now',
    read: false,
    avatarUrl: MOCK_USERS[0].avatarUrl
  },
  {
    id: 'n-2',
    type: 'ACCESS',
    title: 'New Access Request 🔒',
    subtitle: 'ghost_runner_99 requested to view your full location',
    timestamp: '10m ago',
    read: false,
    avatarUrl: MOCK_USERS[2].avatarUrl
  },
  {
    id: 'n-3',
    type: 'SPARK',
    title: 'Spark Joined 🚀',
    subtitle: 'sophia_code joined your Espresso & Startup Chat',
    timestamp: '25m ago',
    read: true,
    avatarUrl: MOCK_USERS[3].avatarUrl
  }
];

export const API_BASE = 'http://localhost:3000';

export async function fetchFeed(radiusKm = 2): Promise<UserPublic[]> {
  try {
    const res = await fetch(`${API_BASE}/feed?lat=50.0875&lng=14.4214&radius=${radiusKm}`, {
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    // fallback to mock
  }
  return MOCK_USERS.filter(u => u.distanceMeters <= radiusKm * 1000);
}
