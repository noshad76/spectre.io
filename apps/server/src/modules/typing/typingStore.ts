
export interface TypingStore {
  addTyper: (roomId: string, userId: string, socketId: string) => void;
  removeTyper: (roomId: string, userId: string, socketId: string) => boolean;
  isUserTyping: (roomId: string, userId: string) => boolean;
}

class InMemoryTypingStore implements TypingStore {
  private rooms = new Map<string, Map<string, Set<string>>>();

  addTyper(roomId: string, userId: string, socketId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const room = this.rooms.get(roomId)!;

    if (!room.has(userId)) {
      room.set(userId, new Set([socketId]));
    } else {
      room.get(userId)!.add(socketId);
    }
  }


  removeTyper(roomId: string, userId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const socketIds = room.get(userId);
    if (!socketIds) return false;

    socketIds.delete(socketId);

    if (socketIds.size === 0) {
      room.delete(userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
      return true; 
    }

    return false; 
  }

  isUserTyping(roomId: string, userId: string): boolean {
    return this.rooms.get(roomId)?.has(userId) ?? false;
  }
}

export const typingStore = new InMemoryTypingStore();
