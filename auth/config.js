const { configDotenv } = require("dotenv");

configDotenv();

module.exports = {
  AUTH_JWT_SECRET:
    process.AUTH_JWT_SECRET ?? "5adec4fdcc0d67553d97825a001ab6c5",
  MONGODB_URI: process.env.MONGODB_URI ?? "mongodb://localhost:27017/myapp",
};
