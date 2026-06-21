import logger from './logger.js';

// Stub for Redis to keep structure clean and allow caching without redis host dependency.
const store = new Map();

export const redisClient = {
  get: async (key) => {
    logger.debug(`[Mock Redis] GET ${key}`);
    return store.get(key) || null;
  },
  set: async (key, value, mode, time) => {
    logger.debug(`[Mock Redis] SET ${key} (mode: ${mode}, time: ${time})`);
    store.set(key, value);
    if (mode === 'EX' && typeof time === 'number') {
      setTimeout(() => {
        store.delete(key);
      }, time * 1000);
    }
    return 'OK';
  },
  del: async (key) => {
    logger.debug(`[Mock Redis] DEL ${key}`);
    return store.delete(key) ? 1 : 0;
  },
  connect: async () => {
    logger.info('Mock Redis Connected');
  }
};

export default redisClient;
