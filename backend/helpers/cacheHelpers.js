const redisClient = require("../config/redis");
const safeExecute = require("../middlewares/globalErrorHandler")

/**
 * Get data from Redis cache
 * @param {string} cacheKey - The key to fetch from Redis
 * @returns {Promise<any|null>} - Parsed cached data or null if not found
 */
const getCache = (cacheKey) => safeExecute(async () => {
    const projectCacheKey = `${process.env.PROJECT}.${cacheKey}`
    const cachedData = await redisClient.get(projectCacheKey);
    if (cachedData) {
        console.log(`✅ Cache hit for ${projectCacheKey}`);
        return JSON.parse(cachedData);
    }
    return null;
});

/**
 * Invalidate a Redis cache key
 * @param {string} cacheKey - The key to remove from Redis
 */
const invalidateCache = (cacheKey) => safeExecute(async () => {
    const projectCacheKey = `${process.env.PROJECT}.${cacheKey}`
    const keys = await redisClient.keys(`${projectCacheKey}:*`);
    if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`❌ Cache invalidated for ${keys.length} keys matching ${projectCacheKey}:*`);
    } else {
        console.log(`⚠️ No cache keys found matching ${projectCacheKey}:*`);
    }
});

/**
 * Set data in Redis cache
 * @param {string} cacheKey - The key to store in Redis
 * @param {any} data - The data to be cached
 * @param {number} expiry - Expiry time in seconds (default: 3600s)
 */
const setCache = (cacheKey, data, expiry = 3600) => safeExecute(async () => {
    const projectCacheKey = `${process.env.PROJECT}.${cacheKey}`
    await redisClient.set(projectCacheKey, JSON.stringify(data), { EX: expiry });
    console.log(`📝 Data cached for ${projectCacheKey}`);
});

module.exports = { getCache, invalidateCache, setCache };