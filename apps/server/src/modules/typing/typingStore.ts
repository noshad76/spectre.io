import { redis } from "../../db/redis";

export interface TypingStore {
  addTyper: (roomId: string, userId: string, socketId: string) => void;
  removeTyper: (
    roomId: string,
    userId: string,
    socketId: string,
  ) => Promise<boolean>;
  isUserTyping: (roomId: string, userId: string) => Promise<boolean>;
}

class RedisTypingStore implements TypingStore {
  private getKey(roomId: string) {
    return `typing:room:${roomId}`;
  }

  async addTyper(roomId: string, userId: string, socketId: string) {
    const key = this.getKey(roomId);
    await redis.hset(key, userId, socketId);
    await redis.expire(key, 10);
  }

  async removeTyper(
    roomId: string,
    userId: string,
    socketId: string,
  ): Promise<boolean> {
    const key = this.getKey(roomId);
    await redis.hdel(key, userId);

    const remaining = await redis.hlen(key);
    return remaining === 0;
  }

  async isUserTyping(roomId: string, userId: string): Promise<boolean> {
    return (await redis.hexists(this.getKey(roomId), userId)) === 1;
  }
}

export const typingStore = new RedisTypingStore();
