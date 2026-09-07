import { count, or, ilike, eq, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { books, fines } from "../../db/schema";
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
        ilike(sql`CAST(${fines.jenisDenda} AS TEXT)`, `%${search}%`),
        ilike(sql`CAST(${fines.hargaDenda} AS TEXT)`, `%${search}%`),
        ilike(sql`CAST(${fines.metodePerhitungan} AS TEXT)`, `%${search}%`),
        ilike(books.judul, `%${search}%`),
      )
    : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: fines.id,
        jenisDenda: fines.jenisDenda,
        hargaDenda: fines.hargaDenda,
        metodePerhitungan: fines.metodePerhitungan,
        judulBuku: books.judul,
        createdAt: fines.createdAt,
      })
      .from(fines)
      .innerJoin(books, eq(fines.bukuId, books.id))
      .where(whereClause)
      .orderBy(desc(fines.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(fines)
      .innerJoin(books, eq(fines.bukuId, books.id))
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

  return result;
}
