import http from 'http';
import app from './app.js';
import connectDB from '../config/database.js';
import redisClient from '../config/redis.js';
import { initSocket } from '../modules/notifications/socket.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

const server = http.createServer(app);

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Connect to cache client (mock stub)
  await redisClient.connect();

  // Initialize socket.io connection handlers
  initSocket(server);

  // Launch HTTP Server listener
  const PORT = env.PORT;
  server.listen(PORT, () => {
    logger.info(`===============================================`);
    logger.info(`   PROJECT NEXUS SERVER UPLINK ESTABLISHED`);
    logger.info(`   PORT: ${PORT} // ENVIRONMENT: ${env.NODE_ENV}`);
    logger.info(`===============================================`);
  });
};

// Error logging for unexpected failures
process.on('unhandledRejection', (err) => {
  logger.error(`[Fatal] Unhandled Rejection: ${err.message}`, { stack: err.stack });
});

startServer();
