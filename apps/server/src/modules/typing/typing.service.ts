import { typingStore } from "./typingStore";

export class TypingService {
 async add(roomId: string, userId: string, socketId: string) {
   await typingStore.addTyper(roomId, userId, socketId);
  }

  async remove(
    roomId: string,
    userId: string,
    socketId: string,
  ): Promise<boolean> {
    return await typingStore.removeTyper(roomId, userId, socketId);
  }

  async isTyping(roomId: string, userId: string): Promise<boolean> {
    return await typingStore.isUserTyping(roomId, userId);
  }
}

export const typingService = new TypingService();
