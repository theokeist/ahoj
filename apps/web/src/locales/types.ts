export type SupportedLanguage = "cs" | "en" | "de" | "sk" | "pl" | "uk" | "ru" | "zh" | "ja";

export interface CommonTranslations {
  nav: {
    home: string;
    about: string;
    signIn: string;
    register: string;
    dashboard: string;
    signOut: string;
  };
  footer: {
    tagline: string;
    madeWith: string;
    backToHome: string;
  };
}

export interface LandingTranslations {
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  getStarted: string;
  signIn: string;
  aboutTech: string;
  mockupHeader: string;
  mockupActive: string;
  features: {
    radarTitle: string;
    radarDesc: string;
    privacyTitle: string;
    privacyDesc: string;
    storiesTitle: string;
    storiesDesc: string;
  };
}

export interface AboutTranslations {
  badge: string;
  title1: string;
  title2: string;
  heroDesc: string;
  joinButton: string;
  signInButton: string;
  statsTitle: string;
  stats: {
    users: string;
    radar: string;
    metIrl: string;
    sparks: string;
  };
  founderQuote: string;
  founderTitle: string;
  privacyTitle: string;
  privacyChecklist: string[];
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
  stories: {
    karolina: string;
    tomas: string;
    tereza: string;
    lukas: string;
    anezka: string;
    marek: string;
    barbora: string;
    ondrej: string;
  };
}

export interface AuthTranslations {
  loginTitle: string;
  loginSubtitle: string;
  demoSignIn: string;
  orEmail: string;
  orOAuth: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signInButton: string;
  noAccount: string;
  createOne: string;
  registerTitle: string;
  registerSubtitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  emailLabel: string;
  passwordLabel: string;
  createAccountButton: string;
  termsNotice: string;
  alreadyHaveAccount: string;
  signInHere: string;
  passwordStrength: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
  features: {
    radar: string;
    chat: string;
    sparks: string;
    ghost: string;
  };
}

export interface DashboardTranslations {
  radarTitle: string;
  grid: string;
  radar: string;
  radius: string;
  activeNearby: string;
  noNearby: string;
  distance: string;
  chatBtn: string;
  sparksTitle: string;
  createSpark: string;
  category: string;
  joinSpark: string;
  noSparks: string;
  chatsTitle: string;
  e2eeNotice: string;
  typeMessage: string;
  send: string;
  noChats: string;
  requestsTitle: string;
  approve: string;
  deny: string;
  noRequests: string;
  settingsTitle: string;
  savedToast: string;
  profileSection: string;
  username: string;
  statusMessage: string;
  bio: string;
  avatarUrl: string;
  privacySection: string;
  privacyPublic: string;
  privacyPublicDesc: string;
  privacyPrivate: string;
  privacyPrivateDesc: string;
  privacyGhost: string;
  privacyGhostDesc: string;
  ghostFuzz: string;
  ghostFuzzDesc: string;
  dmPermission: string;
  dmEveryone: string;
  dmApproved: string;
  dmNobody: string;
  showDistance: string;
  showDistanceDesc: string;
  notificationsSection: string;
  pushEnabled: string;
  nearbyAlert: string;
  sparksAlert: string;
  messagesAlert: string;
  soundEnabled: string;
  appPreferences: string;
  language: string;
  distanceUnit: string;
  metric: string;
  imperial: string;
}

export interface PageTranslations {
  common: CommonTranslations;
  landing: LandingTranslations;
  about: AboutTranslations;
  auth: AuthTranslations;
  dashboard: DashboardTranslations;
}
