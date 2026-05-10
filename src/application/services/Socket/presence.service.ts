import { PRESENCE_TTL } from "@/config";
import { getRedis } from "@/config/redis";

const PREFIX = 'user:presence:';

export class PresenceService {

    async setOnlineStatus(userId: string): Promise<void> {
        const redis = getRedis();
        await redis.set(`${PREFIX}${userId}`, '1', 'EX', PRESENCE_TTL);
    }

    async removeOnlineStatus(userId: string): Promise<void> {
        const redis = getRedis();
        await redis.del(`${PREFIX}${userId}`);
    }
    async isUserOnline(userId: string): Promise<boolean> {
        const redis = getRedis();
        const status = await redis.get(`${PREFIX}${userId}`);
        return status === '1';
    }
}