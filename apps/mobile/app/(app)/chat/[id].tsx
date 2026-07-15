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
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["messages", chatId],
    queryFn: () => chatsApi.getMessages(chatId),
  });

  // Mutation to send message
  const sendMessageMutation = useMutation({
    mutationFn: () => chatsApi.sendMessage(chatId, messageText),
    onSuccess: (newMsg) => {
      setMessageText("");
      // Optimistic update
      queryClient.setQueryData(["messages", chatId], (prev: any) => [
        newMsg,
        ...(prev || []),
      ]);
      // Emit via socket and clear local typing state
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current?.emit("typing:stop", chatId);
      setIsTyping(false);
    },
  });

  // Socket.io subscription
  useEffect(() => {
    if (!token) return;

    // Connect socket
    const socket = io(API_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join", chatId);
    });

    // Listen for new messages
    socket.on("message:new", (msg: ChatMessage) => {
      if (msg.chatId === chatId && msg.senderId !== user?.id) {
        queryClient.setQueryData(["messages", chatId], (prev: any) => [
          msg,
          ...(prev || []),
        ]);
      }
    });

    // Listen for partner typing indicators
    socket.on("user:typing", (data) => {
      if (data.chatId === chatId && data.userId !== user?.id) {
        setPartnerTyping(true);
        if (partnerTypingTimeoutRef.current) {
          clearTimeout(partnerTypingTimeoutRef.current);
        }
        partnerTypingTimeoutRef.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 4000);
      }
    });

    // Listen for partner typing stopped indicator
    socket.on("user:typing_stop", (data) => {
      if (data.chatId === chatId && data.userId !== user?.id) {
        if (partnerTypingTimeoutRef.current) {
          clearTimeout(partnerTypingTimeoutRef.current);
        }
        setPartnerTyping(false);
      }
    });

    return () => {
      socket.emit("chat:leave", chatId);
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, [chatId, token]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate();
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current?.emit("typing:start", chatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", chatId);
      setIsTyping(false);
    }, 2500);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubblePartner]}>
        <Text style={[styles.messageContent, isMe ? styles.textMe : styles.textPartner]}>
          {item.content}
        </Text>
        <Text style={styles.timeLabel}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Conversation</Text>
          {partnerTyping && (
            <Text style={styles.typingIndicator}>typing...</Text>
          )}
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Chat messages */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.messageList}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={handleTextChange}
          placeholder="Send a message..."
          placeholderTextColor={colors.text.tertiary}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendBtnText}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
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
});
