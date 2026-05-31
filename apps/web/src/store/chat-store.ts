import { create } from "zustand";
import type { MessageDTO, PaginatedMessages } from "@spectre/shared/schemas";

export type MessageStatus = "sending" | "sent" | "failed";

export interface ChatMessage extends MessageDTO {
  clientId: string;
  status: MessageStatus;
}

interface ChatState {
  roomId: string | null;
  messages: ChatMessage[];
  pageInfo: PaginatedMessages["pageInfo"] | null;
  userCount: number;
  typingUsers: Map<string, string>;
  roomName: string | null;
  expireTime: string | null;

  setRoomName: (name: string | null) => void;
  setExpireTime: (time: string | null) => void;
  setRoomId: (id: string) => void;

  addOptimisticMessage: (msg: ChatMessage) => void;
  applyMessageAck: (clientId: string, realMsg: MessageDTO) => void;
  addIncomingMessage: (msg: MessageDTO) => void;
  prependHistory: (
    msgs: MessageDTO[],
    pageInfo: PaginatedMessages["pageInfo"],
  ) => void;

  setUserCount: (count: number) => void;
  setTyping: (userId: string, username: string, isTyping: boolean) => void;
  removeTypingUser: (userId: string) => void;
  reset: () => void;
}

const toChatMessage = (
  msg: MessageDTO,
  clientId: string,
  status: MessageStatus,
): ChatMessage => ({
  ...msg,
  clientId,
  status,
});

const normalizeMessages = (messages: ChatMessage[]) => {
  const seen = new Set<string>();
  return messages.filter((m) => {
    const key = m.clientId ? `client:${m.clientId}` : `server:${m.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const useChatStore = create<ChatState>((set) => ({
  roomId: null,
  messages: [],
  roomName: null,
  expireTime: null,
  pageInfo: null,
  userCount: 0,
  typingUsers: new Map(),

  setRoomId: (id) => set({ roomId: id }),
  setRoomName: (name) => set({ roomName: name }),
  setExpireTime: (time) => set({ expireTime: time }),
  setUserCount: (count) => set({ userCount: count }),

  addOptimisticMessage: (msg) =>
    set((s) => ({
      messages: normalizeMessages([...s.messages, msg]),
    })),

  applyMessageAck: (clientId, realMsg) =>
    set((s) => {
      const replaced = s.messages.map((m) =>
        m.clientId === clientId ? toChatMessage(realMsg, clientId, "sent") : m,
      );

      return {
        messages: normalizeMessages(replaced),
      };
    }),
  removeTypingUser: (userId: string) =>
    set((state) => {
      const newTyping = new Map(state.typingUsers);
      newTyping.delete(userId);
      return { typingUsers: newTyping };
    }),
  addIncomingMessage: (msg) =>
    set((s) => {
      const incoming = toChatMessage(msg, msg.id, "sent");

      const next = s.messages.some(
        (m) => m.id === msg.id || m.clientId === msg.id,
      )
        ? s.messages.map((m) =>
            m.id === msg.id || m.clientId === msg.id ? incoming : m,
          )
        : [...s.messages, incoming];

      return {
        messages: normalizeMessages(next),
      };
    }),

  prependHistory: (msgs, pageInfo) =>
    set((s) => {
      const history = msgs
        .slice()
        .reverse()
        .map((m) => toChatMessage(m, m.id, "sent"));

      const merged = [...history, ...s.messages];

      return {
        messages: normalizeMessages(merged),
        pageInfo,
      };
    }),

  setTyping: (userId, username, isTyping) =>
    set((s) => {
      const map = new Map(s.typingUsers);
      if (isTyping) map.set(userId, username);
      else map.delete(userId);
      return { typingUsers: map };
    }),

  reset: () =>
    set({
      roomId: null,
      messages: [],
      pageInfo: null,
      userCount: 0,
      typingUsers: new Map(),
      roomName: null,
      expireTime: null,
    }),
}));
