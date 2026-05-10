import { registerMessageHandlers } from '@/interface/socket/message.handler';
import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';



let io: IOServer;

export function initSocketIO(httpServer: HttpServer): IOServer {
  console.log('Initializing Socket.IO');

  io = new IOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  io.engine.on('connection_error', err => {
    console.log('Socket connection error');

    console.log(err.message);
  });

  io.on('connection', async (socket: Socket) => {
    console.log(
      `[Socket] connected socketId=${socket.id}`,
    );
    registerMessageHandlers(io, socket);

    socket.on('disconnect', reason => {
      console.log(
        `[Socket] disconnected reason=${reason}`,
      );
    });
  });

  return io;
}
