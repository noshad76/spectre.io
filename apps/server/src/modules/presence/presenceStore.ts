export interface PresenceStore {
  addUser: (
    roomId: string,
    userId: string,
    username: string,
    socketId: string
  ) => void;

  removeUser: (
    roomId: string,
    userId: string,
    socketId: string
  ) => void;

  getCount: (roomId: string) => number;
}

type PresenceEntry = {
  username: string;
  socketIds: Set<string>;
};

class InMemoryPresenceStore implements PresenceStore {
  private rooms = new Map<string, Map<string, PresenceEntry>>();

  addUser(roomId: string, userId: string, username: string, socketId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const room = this.rooms.get(roomId)!;

    if (!room.has(userId)) {
      room.set(userId, { username, socketIds: new Set([socketId]) });
    } else {
      room.get(userId)!.socketIds.add(socketId);
    }
  }

  removeUser(roomId: string, userId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const entry = room.get(userId);
    if (!entry) return;

    entry.socketIds.delete(socketId);

    if (entry.socketIds.size === 0) {
      room.delete(userId);
    }

    if (room.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getCount(roomId: string) {
    return this.rooms.get(roomId)?.size ?? 0;
  }
}

export const presenceStore = new InMemoryPresenceStore();
