const LIMIT = 2; // 2 msg / second
const INTERVAL = 1000;

const bucket = new Map<string, number[]>();

export const rateLimitService = {
  check(socketId: string) {
    const now = Date.now();
    const timestamps = bucket.get(socketId) ?? [];

    const recent = timestamps.filter((t) => now - t < INTERVAL);

    if (recent.length >= LIMIT) return true;

    recent.push(now);
    bucket.set(socketId, recent);

    return false;
  },
};
