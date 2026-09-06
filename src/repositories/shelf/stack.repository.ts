import { count, eq, asc, and, or, ilike } from "drizzle-orm";
import { db } from "../../db";
import { stacks } from "../../db/schema";
import redisClient from "../../config/redis";

export async function findStackesWithPagination(
  shelfId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `stack:search:${search}:shelf:${shelfId}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const offset = (page - 1) * limit;

  const whereClause = search
    ? and(
        eq(stacks.rakId, shelfId),
        or(
          ilike(stacks.kdSusunan, `%${search}%`),
          ilike(stacks.nomorSusunan as any, `%${search}%`),
        ),
      )
    : eq(stacks.rakId, shelfId);

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(stacks)
      .where(whereClause)
      .orderBy(asc(stacks.nomorSusunan))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(stacks).where(whereClause),
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
