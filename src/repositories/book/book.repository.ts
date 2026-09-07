import { count, eq, and, ilike, or, desc } from "drizzle-orm";
import { db } from "../../db";
import { books } from "../../db/schema";
import redisClient from "../../config/redis";
import logger from "../../utils/logger";

export async function findBooksWithPagination(
  bookType: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `book:book-type:${bookType}:search:${search}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    logger.info(`Cache hit: Mengambil data dari Redis untuk key ${cacheKey}`);

    return JSON.parse(cachedData);
  }

  logger.info(`Cache miss: Mengambil data dari Database untuk key ${cacheKey}`);

  const offset = (page - 1) * limit;
  const whereClause = search
    ? and(
        eq(books.tipeBuku, bookType as any),
        or(
          ilike(books.judul, `%${search}%`),
          ilike(books.penulis, `%${search}%`),
          ilike(books.penerbit, `%${search}%`),
          ilike(books.isbn, `%${search}%`),
        ),
      )
    : eq(books.tipeBuku, bookType as any);

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(books)
      .where(whereClause)
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(books).where(whereClause),
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
