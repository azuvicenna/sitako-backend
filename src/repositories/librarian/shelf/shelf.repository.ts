import { count, ilike, desc } from "drizzle-orm";
import { db } from "@/db";
import { shelves } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";

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
