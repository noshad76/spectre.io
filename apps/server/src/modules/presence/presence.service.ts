import { presenceStore } from "./presenceStore";

export class PresenceService {
  add(
    roomId: string,
    userId: string,
    username: string,
    socketId: string
  ): number {
    presenceStore.addUser(roomId, userId, username, socketId);
    return presenceStore.getCount(roomId);
  }

  remove(
    roomId: string,
    userId: string,
    socketId: string
  ): number {
    presenceStore.removeUser(roomId, userId, socketId);
    return presenceStore.getCount(roomId);
  }

  count(roomId: string): number {
    return presenceStore.getCount(roomId);
  }
}

export const presenceService = new PresenceService();
