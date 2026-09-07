import { count, eq, asc, and, or, ilike, sql } from "drizzle-orm";
import { db } from "../../db";
import { books, stacks } from "../../db/schema";
import redisClient from "../../config/redis";
import logger from "../../utils/logger";

export async function findStacksWithPagination(
  shelfId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `stack:search:${search}:shelf:${shelfId}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    logger.info(`Cache hit: Mengambil data dari Redis untuk key ${cacheKey}`);

    return JSON.parse(cachedData);
  }

  logger.info(`Cache miss: Mengambil data dari Database untuk key ${cacheKey}`);

  const offset = (page - 1) * limit;

  const whereClause = search
    ? and(
        eq(stacks.rakId, shelfId),
        or(
          ilike(stacks.kdSusunan, `%${search}%`),
          ilike(sql`CAST(${stacks.nomorSusunan} AS TEXT)`, `%${search}%`),
          ilike(books.judul, `%${search}%`),
        ),
      )
    : eq(stacks.rakId, shelfId);

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: stacks.id,
        bukuId: stacks.bukuId,
        kdSusunan: stacks.kdSusunan,
        nomorSusunan: stacks.nomorSusunan,
        judulBuku: books.judul,
        createdAt: stacks.createdAt,
      })
      .from(stacks)
      .innerJoin(books, eq(stacks.bukuId, books.id))
      .where(whereClause)
      .orderBy(asc(stacks.nomorSusunan))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(stacks)
      .innerJoin(books, eq(stacks.bukuId, books.id))
      .where(whereClause),
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
