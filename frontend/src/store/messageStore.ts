import { create } from 'zustand';
import type { ChatMessage } from '@/types/message';

interface MessageStore {
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  typingUsers: Record<string, true>;
  onlineUsers: Record<string, true>;
  currentThreadId: string | null;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (messageId: string) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  setTypingUser: (userId: string, status: boolean) => void;
  setOnlineUser: (userId: string, status: boolean) => void;
  setCurrentThreadId: (threadId: string | null) => void;
  setIsLoadingMessages: (status: boolean) => void;
  clearChannelState: () => void;
}

const sortAscending = (rows: ChatMessage[]) =>
  [...rows].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  isLoadingMessages: false,
  typingUsers: {},
  onlineUsers: {},
  currentThreadId: null,

  setMessages: (messages) => set({ messages: sortAscending(messages) }),

  addMessage: (message) =>
    set((state) => {
      const existingIdx = state.messages.findIndex(
        (m) => m._id === message._id
      );
      if (existingIdx >= 0) {
        const next = [...state.messages];
        next[existingIdx] = message;
        return { messages: sortAscending(next) };
      }
      return { messages: sortAscending([...state.messages, message]) };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, ...updates } : m
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m._id !== messageId),
    })),

  prependMessages: (messages) =>
    set((state) => {
      const map = new Map<string, ChatMessage>();
      [...messages, ...state.messages].forEach((message) => {
        map.set(message._id, message);
      });
      return { messages: sortAscending(Array.from(map.values())) };
    }),

  setTypingUser: (userId, status) =>
    set((state) => {
      const typingUsers = { ...state.typingUsers };
      if (status) {
        typingUsers[userId] = true;
      } else {
        delete typingUsers[userId];
      }
      return { typingUsers };
    }),

  setOnlineUser: (userId, status) =>
    set((state) => {
      const onlineUsers = { ...state.onlineUsers };
      if (status) {
        onlineUsers[userId] = true;
      } else {
        delete onlineUsers[userId];
      }
      return { onlineUsers };
    }),

  setCurrentThreadId: (threadId) => set({ currentThreadId: threadId }),

  setIsLoadingMessages: (status) => set({ isLoadingMessages: status }),

  clearChannelState: () =>
    set({
      messages: [],
      typingUsers: {},
      currentThreadId: null,
      isLoadingMessages: false,
    }),
}));
