import { redis } from "../db/redis";

const LIMIT = 2;

export const rateLimitService = {
  async check(socketId: string): Promise<boolean> {
    const key = `ratelimit:${socketId}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, 1);
    }

    return current > LIMIT;
  },
};
