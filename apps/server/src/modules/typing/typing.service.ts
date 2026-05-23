import { typingStore } from "./typingStore";

export class TypingService {
  add(roomId: string, userId: string, socketId: string) {
    typingStore.addTyper(roomId, userId, socketId);
  }

  remove(roomId: string, userId: string, socketId: string): boolean {
    return typingStore.removeTyper(roomId, userId, socketId);
  }

  isTyping(roomId: string, userId: string): boolean {
    return typingStore.isUserTyping(roomId, userId);
  }
}

export const typingService = new TypingService();
