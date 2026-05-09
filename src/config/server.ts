import express from 'express'; 
import http, { Server as HttpServer } from 'http';
import { connectToDatabase, disconnectFromDatabase } from '@/infrastructure';
import { appRouter } from '@/interface/routers';
import { initSocketIO } from '@/config';
export type AppConfig = {
  port?: number | string;
};

export class Server {
  private app: express.Application;
  private config: AppConfig;
  private server?: HttpServer;
  constructor(config: AppConfig) {
    this.config = config;
    this.app = express();
    this.app.use(express.json());
      this.app.use('/api', appRouter);     
    this.setupGracefulShutdown();
  }
  async start() {
    const port = this.config.port ?? 1209;


    await connectToDatabase();

    // create raw http server
    this.server = http.createServer(this.app);

    // initialize socket.io
    initSocketIO(this.server);

    // start server
    this.server.listen(port, () => {
      console.log(`Server running on port ${port}`);

      console.log(`API available at http://localhost:${port}/api`);
    });
  }
  async stop(): Promise<void> {
    console.log('Shutting down server...');

    return new Promise(resolve => {
      if (this.server) {
        this.server.close(async err => {
          if (err) {
            console.error('Error closing server:', err);
          } else {
            console.log(' HTTP server closed');
          }

          try {
            await disconnectFromDatabase();
            console.log('Server shutdown complete');
            resolve();
          } catch (dbError) {
            console.error('Error disconnecting from database:', dbError);
            resolve(); 
          }
        });
      } else {
        resolve();
      }
    });
  }
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', async error => {
      console.error('Uncaught Exception:', error);
      await this.stop();
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      await this.stop();
      process.exit(1);
    });
  }
}