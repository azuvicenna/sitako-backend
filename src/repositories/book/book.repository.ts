import { count, eq, and, ilike, or, desc } from "drizzle-orm";
import { db } from "../../db";
import { books } from "../../db/schema";
import { withCacheAndPagination } from "../../utils/repository";

export async function findBooksWithPagination(
  bookType: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `book:book-type:${bookType}:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
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

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}
