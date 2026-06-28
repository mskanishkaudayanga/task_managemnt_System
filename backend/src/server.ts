import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('🗄️ Database disconnected successfully.');
    } catch (err) {
      console.error('Error during database disconnection:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
