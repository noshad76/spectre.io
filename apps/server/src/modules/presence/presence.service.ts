import { presenceStore } from "./presenceStore";

export class PresenceService {
  async add(
    roomId: string,
    userId: string,
    username: string,
    socketId: string,
  ): Promise<number> {
    await presenceStore.addUser(roomId, userId, username, socketId);
    return await presenceStore.getCount(roomId);
  }

  async remove(
    roomId: string,
    userId: string,
    socketId: string,
  ): Promise<number> {
    await presenceStore.removeUser(roomId, userId, socketId);
    return await presenceStore.getCount(roomId);
  }

 async count(roomId: string): Promise<number> {
    return await presenceStore.getCount(roomId);
  }
}

export const presenceService = new PresenceService();
