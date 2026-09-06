import { count } from "drizzle-orm";
import { db } from "../../db";
import { members } from "../../db/schema";
import redisClient from "../../config/redis";

export async function findMembersWithPagination(
  page: number = 1,
  limit: number = 10,
) {
  const cacheKey = `member:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select().from(members).limit(limit).offset(offset),
    db.select({ total: count() }).from(members),
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
