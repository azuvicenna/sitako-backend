import { count, eq, asc, and, or, ilike, sql } from "drizzle-orm";
import { db } from "../../../db";
import { books, stacks } from "../../../db/schema";
import { withCacheAndPagination } from "../../../utils/data/repository";

export async function findStacksWithPagination(
  shelfId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `stack:search:${search}:shelf:${shelfId}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
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

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}
