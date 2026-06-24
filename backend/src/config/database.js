import mongoose from 'mongoose';
import logger from './logger.js';
import env from './env.js';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

export default connectDB;
