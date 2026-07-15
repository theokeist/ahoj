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
  }
];

export type Message = {
  id: string;
  sender: "me" | "partner";
  text: string;
  timestamp: string;
};
