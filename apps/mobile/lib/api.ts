import axios from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "../store";

export let API_URL = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000";

if (__DEV__ && Constants.expoConfig?.hostUri) {
  const host = Constants.expoConfig.hostUri.split(":")[0];
  API_URL = `http://${host}:3000`;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

// ─── API functions ────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    dateOfBirth?: string;
  }) => api.post("/auth/register", body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post("/auth/login", body).then((r) => r.data),

  oauth: (body: {
    provider: string;
    providerUserId: string;
    email?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  }) => api.post("/auth/oauth", body).then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),
};

export const feedApi = {
  getProximityFeed: (params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
    cursor?: string;
  }) => api.get("/feed", { params }).then((r) => r.data),

  seedDemo: () => api.post("/feed/seed-demo").then((r) => r.data),
};

export const storiesApi = {
  getUserStories: (userId: string) =>
    api.get(`/stories/${userId}`).then((r) => r.data),

  markViewed: (storyId: string) =>
    api.post(`/stories/${storyId}/view`).then((r) => r.data),

  uploadStory: (body: { mediaUrl: string; mediaType: "IMAGE" | "VIDEO" }) =>
    api.post("/stories", body).then((r) => r.data),

  uploadStoryFile: (uri: string, fileName?: string, mimeType?: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName ?? "story.jpg",
      type: mimeType ?? "image/jpeg",
    } as any);

    return api
      .post("/stories/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data);
  },
};

export const sparksApi = {
  getSparks: (params: { lat: number; lng: number; radius?: number }) =>
    api.get("/sparks", { params }).then((r) => r.data),
  createSpark: (body: {
    title: string;
    description?: string;
    category?: string;
    lat: number;
    lng: number;
  }) => api.post("/sparks", body).then((r) => r.data),
  deleteSpark: (id: string) => api.delete(`/sparks/${id}`).then((r) => r.data),
};

export const usersApi = {
  getMe: () => api.get("/users/me").then((r) => r.data),
  getUser: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  updateProfile: (body: object) =>
    api.put("/users/me", body).then((r) => r.data),
  updateMessage: (message: string) =>
    api.put("/users/me/message", { message }).then((r) => r.data),
  updateLocation: (lat: number, lng: number) =>
    api.put("/users/me/location", { lat, lng }).then((r) => r.data),
  registerFcmToken: (fcmToken: string) =>
    api.post("/users/me/fcm", { fcmToken }).then((r) => r.data),
  getSettings: () => api.get("/users/me/settings").then((r) => r.data),
  updateSettings: (body: object) =>
    api.put("/users/me/settings", body).then((r) => r.data),
};

export const chatsApi = {
  getChats: () => api.get("/chats").then((r) => r.data),
  createChat: (participantId: string) =>
    api.post("/chats", { participantId }).then((r) => r.data),
  getMessages: (chatId: string, cursor?: string) =>
    api
      .get(`/chats/${chatId}/messages`, { params: { cursor } })
      .then((r) => r.data),
  sendMessage: (chatId: string, content: string, type = "TEXT") =>
    api.post(`/chats/${chatId}/messages`, { content, type }).then((r) => r.data),
};

export const accessRequestsApi = {
  request: (targetId: string) =>
    api.post(`/access-requests`, { targetId }).then((r) => r.data),
  getIncoming: () => api.get("/access-requests/incoming").then((r) => r.data),
  approve: (requestId: string) =>
    api.put(`/access-requests/${requestId}/approve`).then((r) => r.data),
  deny: (requestId: string) =>
    api.put(`/access-requests/${requestId}/deny`).then((r) => r.data),
};

export const infoApi = {
  getAppInfo: () => api.get("/info/app").then((r) => r.data),
};
