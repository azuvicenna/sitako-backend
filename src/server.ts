import app from "./app";
import { connectRedis } from "./config/redis";

const PORT = 3000;

app.listen(PORT, async () => {
  try {
    await connectRedis();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }

  console.log(`Server running on http://localhost:${PORT}`);
});
