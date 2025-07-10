const { configDotenv } = require("dotenv");

configDotenv();

const REDIS_HOST = process.env.REDIS_HOST ?? "localhost";
const REDIS_PORT = process.env.REDIS_PORT ?? 6379;
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

module.exports = {
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
};
