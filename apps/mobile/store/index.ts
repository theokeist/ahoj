import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  username: string;
  email: string;
  profilePhotoUrl: string | null;
  message: string;
  privacyMode: "PUBLIC" | "PRIVATE";
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      updateTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: "ahoj-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── Location store ───────────────────────────────────────────────────────────

type LocationState = {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  isGhostMode: boolean;
  setLocation: (lat: number, lng: number, accuracy: number) => void;
  setGhostMode: (enabled: boolean) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      accuracy: null,
      isGhostMode: false,
      setLocation: (lat, lng, accuracy) => set({ lat, lng, accuracy }),
      setGhostMode: (isGhostMode) => set({ isGhostMode }),
    }),
    {
      name: "ahoj-location",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isGhostMode: state.isGhostMode,
      }),
    }
  )
);

// ─── Settings store ─────────────────────────────────────────────────────────

type SettingsState = {
  showStoryBar: boolean;
  setShowStoryBar: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showStoryBar: true,
      setShowStoryBar: (showStoryBar) => set({ showStoryBar }),
    }),
    {
      name: "ahoj-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        showStoryBar: state.showStoryBar,
      }),
    }
  )
);
