import { count, or, ilike, eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { librarians } from "../../db/schema";
import { withCacheAndPagination } from "../../utils/repository";

export async function findLibrariansWithPagination(
  statusActive: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `librarian:status:${statusActive}:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const statusCondition =
        statusActive === "Semua"
          ? undefined
          : eq(librarians.status_aktif, statusActive === "true");

      const searchCondition = search
        ? or(
            ilike(librarians.nama, `%${search}%`),
            ilike(librarians.nip, `%${search}%`),
            ilike(librarians.email, `%${search}%`),
            ilike(librarians.telepon, `%${search}%`),
          )
        : undefined;

      const whereClause = and(statusCondition, searchCondition);

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(librarians)
          .where(whereClause)
          .orderBy(desc(librarians.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(librarians).where(whereClause),
      ]);

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}
