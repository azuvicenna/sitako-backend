import redisClient from "@/config/redis";
import logger from "@/utils/core/logger";

export const withCache = async <T>(
  cacheKey: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> => {
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    logger.debug(`Cache hit: ${cacheKey}`);
    return JSON.parse(cached);
  }

  logger.debug(`Cache miss: ${cacheKey}`);
  
  const data = await fetcher();
  await redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
  
  return data;
};

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
