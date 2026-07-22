const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "API Request failed");
  }

  return data as T;
}

export const webApi = {
  // Auth
  getMe: () => apiFetch<{ user: any }>("/auth/me"),

  // Feed & Nearby
  getNearbyUsers: (lat: number, lng: number, radius: number) =>
    apiFetch<{ users: any[] }>(`/feed/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  // Sparks (Spontaneous Meetups)
  getSparks: (lat: number, lng: number, radius: number) =>
    apiFetch<{ sparks: any[] }>(`/sparks?lat=${lat}&lng=${lng}&radius=${radius}`),
  createSpark: (data: { title: string; description?: string; category: string; lat: number; lng: number }) =>
    apiFetch<{ spark: any }>("/sparks", { method: "POST", body: JSON.stringify(data) }),

  // Chats & Messages
  getConversations: () => apiFetch<{ conversations: any[] }>("/chats/conversations"),
  getMessages: (partnerId: string) => apiFetch<{ messages: any[] }>(`/chats/${partnerId}/messages`),
  sendMessage: (partnerId: string, text: string) =>
    apiFetch<{ message: any }>(`/chats/${partnerId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Access Requests
  getIncomingRequests: () => apiFetch<{ requests: any[] }>("/access-requests/incoming"),
  requestAccess: (targetUserId: string) =>
    apiFetch<{ request: any }>("/access-requests", {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }),
  approveAccess: (requestId: string) =>
    apiFetch<{ success: boolean }>(`/access-requests/${requestId}/approve`, { method: "POST" }),
  denyAccess: (requestId: string) =>
    apiFetch<{ success: boolean }>(`/access-requests/${requestId}/deny`, { method: "POST" }),

  // Stories
  uploadStory: (mediaUrl: string, caption?: string) =>
    apiFetch<{ story: any }>("/stories", {
      method: "POST",
      body: JSON.stringify({ mediaUrl, caption }),
    }),
};
