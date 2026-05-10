import { PresenceService } from '@/application/services/Socket/presence.service';
import { Server, Socket } from 'socket.io';

const presenceService = new PresenceService();
export const registerPresenceHandlers = (io: Server, socket: Socket) => {
    const userId = socket.data.userId;

    presenceService.setOnlineStatus(userId).then(() => {
        socket.join(userId);
        // Broadcast to others that user is online
        socket.broadcast.emit('user_online', { userId });
    });

    // Handle explicit disconnect
    socket.on('disconnect', async () => {
        // Check if user has other active sockets before marking offline
        const sockets = await io.in(userId).fetchSockets();
        if (sockets.length === 0) {
            await presenceService.removeOnlineStatus(userId);
            socket.broadcast.emit('user_offline', { userId });
        }
    });
};