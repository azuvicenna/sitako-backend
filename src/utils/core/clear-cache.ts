import redisClient from "@/config/redis";

export async function clearCacheByPattern(pattern: string | string[]) {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  if (patterns.length === 0) return;

  await Promise.all(patterns.map((p) => clearSinglePattern(p)));
}

async function clearSinglePattern(pattern: string) {
  let cursor = "0";

  do {
    const result = await redisClient.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = String(result.cursor);
    const keys = result.keys;

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } while (cursor !== "0");
}
