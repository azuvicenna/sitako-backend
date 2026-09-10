import app from "./app";
import { connectRedis } from "./config/redis";
import logger from "./utils/core/logger";

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  try {
    await connectRedis();
    logger.info("Connected to Redis successfully");
  } catch (error) {
    logger.error(
      `Failed to connect to Redis: ${error instanceof Error ? error.message : "Unknown Error"}`,
    );
  }

  logger.info(`Server running on http://localhost:${PORT}`);
});
