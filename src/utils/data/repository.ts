import redisClient from "@/config/redis";
import logger from "@/utils/core/logger";

export async function withCacheAndPagination<T>(
  cacheKey: string,
  page: number,
  limit: number,
  fetchData: (
    offset: number,
    limit: number,
  ) => Promise<{ data: T[]; total: number }>,
) {
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    logger.debug(`Cache hit: ${cacheKey}`);
    return JSON.parse(cachedData);
  }

  logger.debug(`Cache miss: ${cacheKey}`);

  const offset = (page - 1) * limit;
  const { data, total } = await fetchData(offset, limit);
  const totalPages = Math.ceil(total / limit);

  const result = {
    data,
    meta: {
      page,
      limit,
      totalRows: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

  return result;
}
