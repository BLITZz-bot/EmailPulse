import { Redis } from 'ioredis';
import { env } from './env';

// BullMQ needs its own Redis connection
export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_TLS ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_TLS ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null,
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));

export default redisClient;
