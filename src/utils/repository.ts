import redisClient from "../config/redis";
import logger from "./logger";

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
    logger.info(`Cache hit: Mengambil data dari Redis untuk key ${cacheKey}`);
    return JSON.parse(cachedData);
  }

  logger.info(`Cache miss: Mengambil data dari Database untuk key ${cacheKey}`);

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
  logger.info(`Data baru berhasil disimpan ke Redis untuk key ${cacheKey}`);

  return result;
}
