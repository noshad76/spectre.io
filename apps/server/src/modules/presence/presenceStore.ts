import { redis } from "../../db/redis";

export interface PresenceStore {
  addUser: (
    roomId: string,
    userId: string,
    username: string,
    socketId: string,
  ) => void;

  removeUser: (roomId: string, userId: string, socketId: string) => void;

  getCount: (roomId: string) => Promise<number>;
}

// type PresenceEntry = {
//   username: string;
//   socketIds: Set<string>;
// };

class RedisPresenceStore implements PresenceStore {
  private getKey(roomId: string) {
    return `presence:room:${roomId}`;
  }
  private getUserKey(roomId: string, userId: string) {
    return `presence:room:${roomId}:user:${userId}`;
  }

  async addUser(
    roomId: string,
    userId: string,
    username: string,
    socketId: string,
  ) {
    const userKey = this.getUserKey(roomId, userId);
    await redis.sadd(userKey, socketId);
    await redis.sadd(this.getKey(roomId), userId);
    await redis.expire(this.getKey(roomId), 86400);
  }

  async removeUser(roomId: string, userId: string, socketId: string) {
    const userKey = this.getUserKey(roomId, userId);
    await redis.srem(userKey, socketId);
    const remainingSockets = await redis.scard(userKey);
    if (remainingSockets === 0) {
      await redis.srem(this.getKey(roomId), userId);
      await redis.del(userKey);
    }
  }

  async getCount(roomId: string): Promise<number> {
    return await redis.scard(this.getKey(roomId));
  }
}

export const presenceStore = new RedisPresenceStore();
