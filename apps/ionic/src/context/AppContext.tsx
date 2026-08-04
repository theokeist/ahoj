import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserPublic,
  SparkPublic,
  StoryPublic,
  ChatMessage,
  ChatItem,
  LoungePublic,
  FlashDealPublic,
  AccessRequestItem,
  SafeZoneItem,
  NotificationItem,
  MOCK_USERS,
  MOCK_SPARKS,
  MOCK_STORIES,
  MOCK_LOUNGES,
  MOCK_DEALS,
  MOCK_ACCESS_REQUESTS,
  MOCK_NOTIFICATIONS,
  fetchFeed
} from '../services/api';

export interface CurrentUser {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
  statusMessage: string;
  privacyMode: 'PUBLIC' | 'PRIVATE' | 'GHOST';
  ghostFuzzMeters: number;
  distanceUnit: 'metric' | 'imperial';
  language: string;
  interests: string[];
}

interface AppContextType {
  currentUser: CurrentUser;
  updateCurrentUser: (updates: Partial<CurrentUser>) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  nearbyUsers: UserPublic[];
  sparks: SparkPublic[];
  stories: StoryPublic[];
  chats: ChatItem[];
  lounges: LoungePublic[];
  flashDeals: FlashDealPublic[];
  accessRequests: AccessRequestItem[];
  safeZones: SafeZoneItem[];
  notifications: NotificationItem[];

  activeChat: ChatItem | null;
  activeChatMessages: ChatMessage[];
  setActiveChat: (chat: ChatItem | null) => void;
  sendMessage: (text: string) => void;

  createSpark: (title: string, description: string, category: SparkPublic['category']) => void;
  joinSpark: (sparkId: string) => void;

  activeStory: StoryPublic | null;
  setActiveStory: (story: StoryPublic | null) => void;
  createStory: (mediaUrl: string, caption: string, locationName?: string) => void;

  activeLounge: LoungePublic | null;
  setActiveLounge: (lounge: LoungePublic | null) => void;
  createLounge: (title: string, venueName: string, category: LoungePublic['category'], description: string) => void;
  joinLounge: (lounge: LoungePublic) => void;
  leaveLounge: () => void;
  isMicMuted: boolean;
  toggleMic: () => void;

  requestAccess: (userId: string) => void;
  approveAccessRequest: (requestId: string) => void;
  denyAccessRequest: (requestId: string) => void;

  claimDeal: (dealId: string) => void;

  addSafeZone: (name: string, radiusMeters: number) => void;
  toggleSafeZone: (id: string) => void;

  unreadNotificationsCount: number;
  markNotificationsRead: () => void;

  sosActive: boolean;
  triggerSos: () => void;
  cancelSos: () => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;

  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isAccessRequestsOpen: boolean;
  setIsAccessRequestsOpen: (open: boolean) => void;
  isStoryCreateOpen: boolean;
  setIsStoryCreateOpen: (open: boolean) => void;
}

const defaultUser: CurrentUser = {
  id: 'me-100',
  username: 'martasko14',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  bio: 'Building the next-gen proximity social network 🚀 /A\\ ahoj',
  statusMessage: 'Exploring nearby vibes ⚡️',
  privacyMode: 'PUBLIC',
  ghostFuzzMeters: 300,
  distanceUnit: 'metric',
  language: 'cs',
  interests: ['code', 'coffee', 'tech', 'design', 'prague']
};

const INITIAL_CHATS: ChatItem[] = [
  {
    id: 'chat-1',
    user: MOCK_USERS[0],
    lastMessage: 'Hey! Are you still at Bitcoin Coffee?',
    lastMessageTime: '12:42',
    unreadCount: 1
  },
  {
    id: 'chat-2',
    user: MOCK_USERS[1],
    lastMessage: 'Let me know if you want to join the night photoshoot!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0
  }
];

const INITIAL_SAFE_ZONES: SafeZoneItem[] = [
  { id: 'sz-1', name: 'Home Geofence', radiusMeters: 400, fuzzLevel: 'GHOST', isActive: true },
  { id: 'sz-2', name: 'Work Campus', radiusMeters: 250, fuzzLevel: 'APPROXIMATE', isActive: false }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(defaultUser);
  const [radiusKm, setRadiusKm] = useState<number>(2);
  const [nearbyUsers, setNearbyUsers] = useState<UserPublic[]>(MOCK_USERS);
  const [sparks, setSparks] = useState<SparkPublic[]>(MOCK_SPARKS);
  const [stories, setStories] = useState<StoryPublic[]>(MOCK_STORIES);
  const [lounges, setLounges] = useState<LoungePublic[]>(MOCK_LOUNGES);
  const [flashDeals, setFlashDeals] = useState<FlashDealPublic[]>(MOCK_DEALS);
  const [accessRequests, setAccessRequests] = useState<AccessRequestItem[]>(MOCK_ACCESS_REQUESTS);
  const [safeZones, setSafeZones] = useState<SafeZoneItem[]>(INITIAL_SAFE_ZONES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const [chats, setChats] = useState<ChatItem[]>(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([
    { id: 'm-1', chatId: 'chat-1', senderId: 'u-1', content: 'Hey there! Saw your status on Ahoj radar 👋', createdAt: '12:40', isMe: false },
    { id: 'm-2', chatId: 'chat-1', senderId: 'me-100', content: 'Ahoj! Yeah, working on the app right nearby.', createdAt: '12:41', isMe: true },
    { id: 'm-3', chatId: 'chat-1', senderId: 'u-1', content: 'Hey! Are you still at Bitcoin Coffee?', createdAt: '12:42', isMe: false }
  ]);

  const [activeStory, setActiveStory] = useState<StoryPublic | null>(null);
  const [activeLounge, setActiveLounge] = useState<LoungePublic | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(true);

  const [sosActive, setSosActive] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccessRequestsOpen, setIsAccessRequestsOpen] = useState(false);
  const [isStoryCreateOpen, setIsStoryCreateOpen] = useState(false);

  useEffect(() => {
    fetchFeed(radiusKm).then(users => {
      setNearbyUsers(users);
    });
  }, [radiusKm]);

  const updateCurrentUser = (updates: Partial<CurrentUser>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const createSpark = (title: string, description: string, category: SparkPublic['category']) => {
    const newSpark: SparkPublic = {
      id: `s-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatarUrl: currentUser.avatarUrl,
      title,
      description,
      category,
      distanceMeters: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 120 * 60000).toISOString(),
      participantsCount: 1,
      isJoined: true
    };
    setSparks(prev => [newSpark, ...prev]);
  };

  const joinSpark = (sparkId: string) => {
    setSparks(prev =>
      prev.map(s => {
        if (s.id === sparkId) {
          const nextJoined = !s.isJoined;
          return {
            ...s,
            isJoined: nextJoined,
            participantsCount: (s.participantsCount || 1) + (nextJoined ? 1 : -1)
          };
        }
        return s;
      })
    );
  };

  const createStory = (mediaUrl: string, caption: string, locationName?: string) => {
    const newStory: StoryPublic = {
      id: `st-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatarUrl: currentUser.avatarUrl,
      mediaUrl,
      caption,
      createdAt: 'Just now',
      locationName: locationName || 'Nearby Spot',
      viewsCount: 1
    };
    setStories(prev => [newStory, ...prev]);
  };

  const createLounge = (title: string, venueName: string, category: LoungePublic['category'], description: string) => {
    const newLounge: LoungePublic = {
      id: `l-${Date.now()}`,
      title,
      venueName,
      category,
      distanceMeters: 0,
      speakerCount: 1,
      listenerCount: 1,
      activeSpeakers: [
        { id: currentUser.id, name: currentUser.username, avatarUrl: currentUser.avatarUrl, isSpeaking: true }
      ],
      description
    };
    setLounges(prev => [newLounge, ...prev]);
    setActiveLounge(newLounge);
  };

  const joinLounge = (lounge: LoungePublic) => {
    setActiveLounge(lounge);
  };

  const leaveLounge = () => {
    setActiveLounge(null);
    setIsMicMuted(true);
  };

  const toggleMic = () => {
    setIsMicMuted(prev => !prev);
  };

  const requestAccess = (userId: string) => {
    setNearbyUsers(prev => prev.map(u => u.id === userId ? { ...u, accessStatus: 'PENDING' } : u));
  };

  const approveAccessRequest = (requestId: string) => {
    setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));
  };

  const denyAccessRequest = (requestId: string) => {
    setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'DENIED' } : r));
  };

  const claimDeal = (dealId: string) => {
    setFlashDeals(prev => prev.map(d => d.id === dealId ? { ...d, isClaimed: true } : d));
  };

  const addSafeZone = (name: string, radiusMeters: number) => {
    const newZone: SafeZoneItem = {
      id: `sz-${Date.now()}`,
      name,
      radiusMeters,
      fuzzLevel: 'GHOST',
      isActive: true
    };
    setSafeZones(prev => [...prev, newZone]);
  };

  const toggleSafeZone = (id: string) => {
    setSafeZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const triggerSos = () => {
    setSosActive(true);
    const sosNote: NotificationItem = {
      id: `n-${Date.now()}`,
      type: 'PROXIMITY',
      title: '🚨 COMMUNITY SOS BROADCAST',
      subtitle: 'Emergency alert pinged to nearby users within 1km',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [sosNote, ...prev]);
  };

  const cancelSos = () => {
    setSosActive(false);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || !activeChat) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setActiveChatMessages(prev => [...prev, msg]);
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMessage: text, lastMessageTime: msg.createdAt } : c));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      updateCurrentUser,
      radiusKm,
      setRadiusKm,
      nearbyUsers,
      sparks,
      stories,
      chats,
      lounges,
      flashDeals,
      accessRequests,
      safeZones,
      notifications,
      activeChat,
      activeChatMessages,
      setActiveChat,
      sendMessage,
      createSpark,
      joinSpark,
      activeStory,
      setActiveStory,
      createStory,
      activeLounge,
      setActiveLounge,
      createLounge,
      joinLounge,
      leaveLounge,
      isMicMuted,
      toggleMic,
      requestAccess,
      approveAccessRequest,
      denyAccessRequest,
      claimDeal,
      addSafeZone,
      toggleSafeZone,
      unreadNotificationsCount,
      markNotificationsRead,
      sosActive,
      triggerSos,
      cancelSos,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isLoggedIn,
      setIsLoggedIn,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isAccessRequestsOpen,
      setIsAccessRequestsOpen,
      isStoryCreateOpen,
      setIsStoryCreateOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
