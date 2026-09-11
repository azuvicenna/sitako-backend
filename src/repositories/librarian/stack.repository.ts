import { count, eq, ilike, and, sql, or, asc } from "drizzle-orm";
import { db } from "@/db";
import { stacks, books } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/cache";

export type StackInsert = typeof stacks.$inferInsert;
export type StackSelect = typeof stacks.$inferSelect;

const clearStackCache = async () => {
  await clearCacheByPattern(`stack:*`);
};

export async function findStacksWithPagination(
  shelfId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `stack:${shelfId}:search:${search}:shelf:${shelfId}:page:${page}:limit:${limit}`;

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

export async function findStack(id: string): Promise<StackSelect | null> {
  const result = await db
    .select()
    .from(stacks)
    .where(eq(stacks.id, id))
    .limit(1);
  return result[0] || null;
}

export const insertStack = async (data: StackInsert): Promise<StackSelect> => {
  const result = await db.insert(stacks).values(data).returning();
  const created = result[0];

  if (created) {
    await clearStackCache();
  }

  return created;
};

export const updateStackById = async (
  id: string,
  data: Partial<StackInsert>,
): Promise<StackSelect | null> => {
  const result = await db
    .update(stacks)
    .set(data)
    .where(eq(stacks.id, id))
    .returning();

  const updated = result[0] || null;

  if (updated) {
    await clearStackCache();
  }

  return updated;
};

export const removeStackById = async (
  id: string,
): Promise<StackSelect | null> => {
  const result = await db.delete(stacks).where(eq(stacks.id, id)).returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearStackCache();
  }

  return deleted;
};
