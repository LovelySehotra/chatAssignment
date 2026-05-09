import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './env.config';


let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: REDIS_HOST,
      port:Number (REDIS_PORT),
      password: REDIS_PASSWORD,
      lazyConnect: true,
      enableReadyCheck: true,
    });

    redisClient.on('connect', () => console.log(' Redis connected'));
    redisClient.on('error', (err) => console.error('Redis error:', err));
    redisClient.on('close', () => console.warn('Redis connection closed'));
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  await getRedis().connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
