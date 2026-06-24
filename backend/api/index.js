import app from '../src/app/app.js';
import connectDB from '../src/config/database.js';
import redisClient from '../src/config/redis.js';

// Immediately trigger database and redis mock stubs
connectDB();
redisClient.connect();

export default app;
