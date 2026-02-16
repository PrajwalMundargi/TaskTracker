const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 300; // 5 minutes

let redis;

function tasksCacheKey(userId) {
  return `tasks:${userId}`;
}

async function getCachedTasks(userId) {
  if (!redis) return null;
  try {
    const data = await redis.get(tasksCacheKey(userId));
    return data ? JSON.parse(data) : null;
  } catch (_e) {
    return null;
  }
}

async function setCachedTasks(userId, tasks) {
  if (!redis) return;
  try {
    await redis.set(tasksCacheKey(userId), JSON.stringify(tasks), 'EX', CACHE_TTL);
  } catch (_e) {
    // silently ignore cache write failures
  }
}

async function invalidateTasksCache(userId) {
  if (!redis) return;
  try {
    await redis.del(tasksCacheKey(userId));
  } catch (_e) {
    // silently ignore cache delete failures
  }
}

async function connectRedis() {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.warn('Redis error:', err.message);
    });

    await redis.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.warn('Redis unavailable, caching disabled:', err.message);
    if (redis) {
      redis.disconnect();
    }
    redis = null;
  }
}

module.exports = { getCachedTasks, setCachedTasks, invalidateTasksCache, connectRedis };
