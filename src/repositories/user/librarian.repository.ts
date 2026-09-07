import { count, or, ilike, eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { librarians } from "../../db/schema";
import redisClient from "../../config/redis";
import logger from "../../utils/logger";

export async function findLibrariansWithPagination(
  statusActive: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `librarian:status:${statusActive}:search:${search}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    logger.info(`Cache hit: Mengambil data dari Redis untuk key ${cacheKey}`);

    return JSON.parse(cachedData);
  }

  logger.info(`Cache miss: Mengambil data dari Database untuk key ${cacheKey}`);

  const offset = (page - 1) * limit;

  const statusCondition =
    statusActive === "Semua"
      ? undefined
      : eq(librarians.status_aktif, statusActive === "true");

  const searchCondition = search
    ? or(
        ilike(librarians.nama, `%${search}%`),
        ilike(librarians.nip, `%${search}%`),
        ilike(librarians.email, `%${search}%`),
        ilike(librarians.telepon, `%${search}%`),
      )
    : undefined;

  const whereClause = and(statusCondition, searchCondition);

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(librarians)
      .where(whereClause)
      .orderBy(desc(librarians.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(librarians).where(whereClause),
  ]);

  const totalRows = Number(countResult[0]?.total ?? 0);
  const totalPages = Math.ceil(totalRows / limit);

  const result = {
    data,
    meta: {
      page,
      limit,
      totalRows,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

  logger.info(`Data baru berhasil disimpan ke Redis untuk key ${cacheKey}`);

  return result;
}
