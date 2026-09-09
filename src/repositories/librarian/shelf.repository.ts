import { count, eq, ilike, desc } from "drizzle-orm";
import { db } from "@/db";
import { shelves } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/clear-cache";

export type ShelfInsert = typeof shelves.$inferInsert;
export type ShelfSelect = typeof shelves.$inferSelect;

const clearShelfCache = async () => {
  await clearCacheByPattern(`shelf:*`);
};

export async function findShelvesWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `shelf:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const whereClause = search
        ? ilike(shelves.namaRak, `%${search}%`)
        : undefined;

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(shelves)
          .where(whereClause)
          .orderBy(desc(shelves.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(shelves).where(whereClause),
      ]);

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}

export async function findShelf(id: string): Promise<ShelfSelect | null> {
  const result = await db
    .select()
    .from(shelves)
    .where(eq(shelves.id, id))
    .limit(1);
  return result[0] || null;
}

export const insertShelf = async (data: ShelfInsert): Promise<ShelfSelect> => {
  const result = await db.insert(shelves).values(data).returning();
  const created = result[0];

  if (created) {
    await clearShelfCache();
  }

  return created;
};

export const updateShelfById = async (
  id: string,
  data: Partial<ShelfInsert>,
): Promise<ShelfSelect | null> => {
  const result = await db
    .update(shelves)
    .set(data)
    .where(eq(shelves.id, id))
    .returning();

  const updated = result[0] || null;

  if (updated) {
    await clearShelfCache();
  }

  return updated;
};

export const removeShelfById = async (
  id: string,
): Promise<ShelfSelect | null> => {
  const result = await db.delete(shelves).where(eq(shelves.id, id)).returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearShelfCache();
  }

  return deleted;
};
