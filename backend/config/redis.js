const redis = require("redis");

// Create Redis client
const redisClient = redis.createClient({
    socket: {
        host: "127.0.0.1",
        port: 6379,
    },
});

redisClient.on("connect", () => console.log("🚀 Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));

redisClient.connect();

module.exports = redisClient;