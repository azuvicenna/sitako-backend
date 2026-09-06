import { count, or, ilike } from "drizzle-orm";
import { db } from "../../db";
import { fines } from "../../db/schema";
import redisClient from "../../config/redis";

export async function findFinesWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `fine:search:${search}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const offset = (page - 1) * limit;
  const whereClause = search
    ? or(
        ilike(fines.jenisDenda as any, `%${search}%`),
        ilike(fines.hargaDenda as any, `%${search}%`),
        ilike(fines.metodePerhitungan as any, `%${search}%`),
      )
    : undefined;

  const [data, countResult] = await Promise.all([
    db.select().from(fines).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(fines).where(whereClause),
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

  return result;
}
