import { Server } from 'socket.io';
import logger from '../../config/logger.js';

let ioInstance = null;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Configured for standard development fallback
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join specific product room
    socket.on('joinProduct', (productId) => {
      socket.join(productId);
      const currentViewers = io.sockets.adapter.rooms.get(productId)?.size || 0;
      logger.debug(`Client joined product room ${productId}. Count: ${currentViewers}`);
      io.to(productId).emit('viewersCount', { productId, count: currentViewers });
    });

    // Leave specific product room
    socket.on('leaveProduct', (productId) => {
      socket.leave(productId);
      const currentViewers = io.sockets.adapter.rooms.get(productId)?.size || 0;
      logger.debug(`Client left product room ${productId}. Count: ${currentViewers}`);
      io.to(productId).emit('viewersCount', { productId, count: currentViewers });
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          const currentViewers = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
          io.to(room).emit('viewersCount', { productId: room, count: Math.max(0, currentViewers) });
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Send real-time inventory depletion updates to clients in product room
export const emitStockUpdate = (productId, countInStock) => {
  if (ioInstance) {
    logger.debug(`Broadcasting stock depletion for ${productId}: ${countInStock} items`);
    ioInstance.to(productId.toString()).emit('stockUpdate', { productId, countInStock });
    // Also emit globally for catalog list alerts
    ioInstance.emit('globalStockUpdate', { productId, countInStock });
  }
};

export const getIo = () => ioInstance;
export default initSocket;
