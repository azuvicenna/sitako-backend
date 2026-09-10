import { count, eq, and, ilike, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/clear-cache";
import { invalidateDashboardCache } from "./dashboard.repository";

export type BookInsert = typeof books.$inferInsert;
export type BookSelect = typeof books.$inferSelect;

const clearBookCache = async (bookType?: string) => {
  const pattern = bookType ? `book:book-type:${bookType}:*` : `book:*`;
  await clearCacheByPattern(pattern);
  await invalidateDashboardCache();
};

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
            eq(books.tipeBuku, bookType as BookSelect["tipeBuku"]),
            or(
              ilike(books.judul, `%${search}%`),
              ilike(books.penulis, `%${search}%`),
              ilike(books.penerbit, `%${search}%`),
              ilike(books.isbn, `%${search}%`),
            ),
          )
        : eq(books.tipeBuku, bookType as BookSelect["tipeBuku"]);

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

export async function findBook(id: string): Promise<BookSelect | null> {
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return result[0] || null;
}

export const insertBook = async (data: BookInsert): Promise<BookSelect> => {
  const result = await db.insert(books).values(data).returning();
  const created = result[0];

  if (created) {
    await clearBookCache(created.tipeBuku);
  }

  return created;
};

export const updateBookById = async (
  id: string,
  data: Partial<BookInsert>,
): Promise<BookSelect | null> => {
  const result = await db
    .update(books)
    .set(data)
    .where(eq(books.id, id))
    .returning();
  const updated = result[0] || null;

  if (updated) {
    await clearBookCache();
  }

  return updated;
};

export const removeBookById = async (
  id: string,
): Promise<BookSelect | null> => {
  const result = await db.delete(books).where(eq(books.id, id)).returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearBookCache(deleted.tipeBuku);
  }

  return deleted;
};
