import { count, eq, or, ilike, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { fines, books } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/cache";

export type FineInsert = typeof fines.$inferInsert;
export type FineSelect = typeof fines.$inferSelect;

const clearFineCache = async () => {
  await clearCacheByPattern(`fine:*`);
};

export async function findFinesWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `fine:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
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

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}

export async function findFine(id: string): Promise<FineSelect | null> {
  const result = await db.select().from(fines).where(eq(fines.id, id)).limit(1);
  return result[0] || null;
}

export const insertFine = async (data: FineInsert): Promise<FineSelect> => {
  const result = await db.insert(fines).values(data).returning();
  const created = result[0];

  if (created) {
    await clearFineCache();
  }

  return created;
};

export const updateFineById = async (
  id: string,
  data: Partial<FineInsert>,
): Promise<FineSelect | null> => {
  const result = await db
    .update(fines)
    .set(data)
    .where(eq(fines.id, id))
    .returning();

  const updated = result[0] || null;

  if (updated) {
    await clearFineCache();
  }

  return updated;
};

export const removeFineById = async (
  id: string,
): Promise<FineSelect | null> => {
  const result = await db.delete(fines).where(eq(fines.id, id)).returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearFineCache();
  }

  return deleted;
};
