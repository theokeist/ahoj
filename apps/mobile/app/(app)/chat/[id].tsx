import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { chatsApi, usersApi, API_URL } from "../../../lib/api";
import { useAuthStore } from "../../../store";
import { colors, spacing, typography, radius } from "../../../lib/theme";
import type { ChatMessage } from "@ahoj/shared";

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const partnerTypingTimeoutRef = useRef<any>(null);

  // Get chat history
  const { data: rawMessages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["messages", chatId],
    queryFn: () => chatsApi.getMessages(chatId),
    enabled: chatId !== "ahoj-notification" && chatId !== "ahoj-notifications",
  });

  const isNotificationChat = chatId === "ahoj-notification" || chatId === "ahoj-notifications";

  const sampleNotifications: any[] = [
    {
      id: "n-1",
      title: "New Proximity Story 📸",
      body: "@natalie_s (~120m away) posted a new story: 'Hledám parťáka na turistiku 🏔️'",
      timestamp: "2m ago",
      category: "USER",
      categoryLabel: "Users 👤",
      badgeIcon: "📸",
      unread: true,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
      actions: [{ label: "View Story 📸", variant: "primary" }],
    },
    {
      id: "n-2",
      title: "Spontaneous Spark Meetup ⚡",
      body: "@kubajz created a Spark ~45m away: 'Specialty Coffee & Tech Chat ☕' at Skog Urban Hub.",
      timestamp: "15m ago",
      category: "SPARK",
      categoryLabel: "Sparks ⚡",
      badgeIcon: "⚡",
      unread: true,
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150",
      actions: [{ label: "Join Spark ⚡", variant: "primary" }],
    },
    {
      id: "n-3",
      title: "Private Profile Access Request 🔒",
      body: "@secret_vibe requested access to view your stories and private profile details.",
      timestamp: "45m ago",
      category: "USER",
      categoryLabel: "Users 👤",
      badgeIcon: "🔒",
      unread: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
      actions: [
        { label: "Approve ✓", variant: "success" },
        { label: "Deny ✕", variant: "danger" },
      ],
    },
    {
      id: "n-4",
      title: "Google+ +1 Endorsement 🎉",
      body: "@emma_art and 5 nearby users +1'd your status message: 'Ahoj Brno!'",
      timestamp: "1h ago",
      category: "USER",
      categoryLabel: "Users 👤",
      badgeIcon: "🎉",
      unread: false,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
      actions: [{ label: "View Profile", variant: "secondary" }],
    },
    {
      id: "n-5",
      title: "Proximity Radar Sweep 📡",
      body: "4 active users found in your 3km radius around Brno Center.",
      timestamp: "2h ago",
      category: "RADAR",
      categoryLabel: "Radar 📍",
      badgeIcon: "📍",
      unread: false,
      actions: [{ label: "Open Radar 📡", variant: "primary" }],
    },
    {
      id: "n-6",
      title: "Ghost Mode Security Guard 👻",
      body: "Location fuzzing is set to 300m. Your exact location is hidden while keeping nearby discovery active.",
      timestamp: "4h ago",
      category: "INFO",
      categoryLabel: "Info ℹ️",
      badgeIcon: "ℹ️",
      unread: false,
      actions: [{ label: "Privacy Settings ⚙️", variant: "secondary" }],
    },
  ];

  const messages = isNotificationChat
    ? (rawMessages.length > 0 ? rawMessages : sampleNotifications)
    : rawMessages;

  // Mutation to send message
  const sendMessageMutation = useMutation({
    mutationFn: () => chatsApi.sendMessage(chatId, messageText),
    onSuccess: (newMsg) => {
      setMessageText("");
      queryClient.setQueryData(["messages", chatId], (prev: any) => [
        newMsg,
        ...(prev || []),
      ]);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketRef.current?.emit("typing:stop", chatId);
      setIsTyping(false);
    },
  });

  // Socket.io subscription
  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join", chatId);
    });

    socket.on("message:new", (msg: ChatMessage) => {
      if (msg.chatId === chatId && msg.senderId !== user?.id) {
        queryClient.setQueryData(["messages", chatId], (prev: any) => [
          msg,
          ...(prev || []),
        ]);
      }
    });

    return () => {
      socket.emit("chat:leave", chatId);
      socket.disconnect();
    };
  }, [chatId, token]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate();
  };

  if (isNotificationChat) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Traditional Notification Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.notifSubtitle}>3 unread alerts</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Traditional Notifications List */}
        <FlatList
          data={sampleNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.notifItem, item.unread && styles.notifItemUnread]}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: item.avatarUrl }} style={styles.notifAvatar} />
                <View style={styles.badgeOverlay}>
                  <Text style={{ fontSize: 10 }}>{item.badgeIcon}</Text>
                </View>
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.categoryBadge}>{item.categoryLabel}</Text>
                </View>

                <Text style={styles.notifBody}>{item.body}</Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {item.actions?.map((act: any, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.actionBtn,
                          act.variant === "primary" && styles.btnPrimary,
                          act.variant === "success" && styles.btnSuccess,
                          act.variant === "danger" && styles.btnDanger,
                        ]}
                      >
                        <Text style={[styles.actionBtnText, act.variant === "primary" && { color: "#000" }]}>
                          {act.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.notifTime}>{item.timestamp}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: { width: 60 },
  backText: { color: colors.primary, fontSize: typography.base, fontWeight: typography.medium },
  headerInfo: { alignItems: "center" },
  headerTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.text.primary,
  },
  typingIndicator: {
    fontSize: 10,
    color: colors.online,
    fontWeight: typography.bold,
    marginTop: 2,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageList: { padding: spacing.md, gap: spacing.md },
  messageBubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
    maxWidth: "80%",
    gap: 4,
  },
  bubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubblePartner: {
    alignSelf: "flex-start",
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageContent: {
    fontSize: typography.base,
    lineHeight: 20,
  },
  textMe: { color: "#fff" },
  textPartner: { color: colors.text.primary },
  timeLabel: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.5)",
    alignSelf: "flex-end",
  },
  inputBar: {
    flexDirection: "row",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: typography.base,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: typography.bold,
  },
  notifSubtitle: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: typography.bold,
    marginTop: 2,
  },
  notifItem: {
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background.primary,
  },
  notifItemUnread: {
    backgroundColor: "rgba(0, 242, 254, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  avatarWrap: {
    position: "relative",
  },
  notifAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  badgeOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0C0C0C",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.text.primary,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: typography.bold,
    color: colors.primary,
    backgroundColor: "rgba(0, 242, 254, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  notifBody: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSuccess: {
    backgroundColor: "#4CAF50",
  },
  btnDanger: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.4)",
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: typography.bold,
    color: "#fff",
  },
});
