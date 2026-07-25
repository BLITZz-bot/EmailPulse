import redisClient from '../config/redis';
import { env } from '../config/env';

// Key format: ratelimit:{sender}:{YYYY-MM-DD-HH}
function getRateLimitKey(sender: string): string {
  const now = new Date();
  const window = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}-${String(now.getUTCHours()).padStart(2, '0')}`;
  return `ratelimit:${sender}:${window}`;
}

export async function checkAndIncrementRateLimit(sender: string): Promise<{
  allowed: boolean;
  count: number;
  nextWindowMs: number;
}> {
  const key = getRateLimitKey(sender);
  const limit = env.MAX_EMAILS_PER_HOUR_PER_SENDER;

  // Atomic increment
  const count = await redisClient.incr(key);

  // Set expiry of 2 hours on first increment (safety buffer)
  if (count === 1) {
    await redisClient.expire(key, 7200);
  }

  if (count > limit) {
    // Roll back — this slot is over limit
    await redisClient.decr(key);

    // Calculate ms until next hour window
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
    const nextWindowMs = nextHour.getTime() - now.getTime();

    return { allowed: false, count: count - 1, nextWindowMs };
  }

  return { allowed: true, count, nextWindowMs: 0 };
}

export async function getCurrentRateLimit(sender: string): Promise<number> {
  const key = getRateLimitKey(sender);
  const val = await redisClient.get(key);
  return val ? parseInt(val, 10) : 0;
}
