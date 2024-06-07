import { createClient } from "redis";
import RedisStore from "connect-redis";
import { logger } from "../utils/logger";

let redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});
redisClient.on("error", (err) => {
  logger.error(`Redis client error: ${err}`);
  process.exit(1);
});

let sessionStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
});

export default sessionStore;
