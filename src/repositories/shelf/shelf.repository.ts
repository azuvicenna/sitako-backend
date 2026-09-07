import { count, ilike, desc } from "drizzle-orm";
import { db } from "../../db";
import { shelves } from "../../db/schema";
import redisClient from "../../config/redis";

export async function findShelvesWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `shelf:search:${search}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const offset = (page - 1) * limit;
  const whereClause = search
    ? ilike(shelves.namaRak, `%${search}%`)
    : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(shelves)
      .where(whereClause)
      .orderBy(desc(shelves.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(shelves).where(whereClause),
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
