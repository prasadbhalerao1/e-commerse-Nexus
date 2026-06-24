import mongoose from 'mongoose';
import env from '../config/env.js';

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const formatMemory = (bytes) => {
  return `${Math.round((bytes / 1024 / 1024) * 100) / 100} MB`;
};

const landingHandler = (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const healthData = {
    status: dbStatus === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    environment: env.NODE_ENV || 'production',
    services: {
      database: {
        status: dbStateMap[dbStatus] || 'unknown',
        name: 'MongoDB'
      },
      cache: {
        status: 'connected',
        name: 'Mock Redis'
      }
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rss: formatMemory(process.memoryUsage().rss),
        heapTotal: formatMemory(process.memoryUsage().heapTotal),
        heapUsed: formatMemory(process.memoryUsage().heapUsed)
      }
    }
  };

  res.status(200).json(healthData);
};

export default landingHandler;
