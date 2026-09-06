import { count, or, ilike, eq, and } from "drizzle-orm";
import { db } from "../../db";
import { members } from "../../db/schema";
import redisClient from "../../config/redis";

export async function findMembersWithPagination(
  statusActive: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `member:search:${search}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const offset = (page - 1) * limit;

  const statusCondition =
    statusActive === "Semua"
      ? undefined
      : eq(members.status_aktif, statusActive === "true");

  const searchCondition = search
    ? or(
        ilike(members.nama, `%${search}%`),
        ilike(members.nis, `%${search}%`),
        ilike(members.email, `%${search}%`),
        ilike(members.telepon, `%${search}%`),
      )
    : undefined;

  const whereClause = and(statusCondition, searchCondition);

  const [data, countResult] = await Promise.all([
    db.select().from(members).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(members).where(whereClause),
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
