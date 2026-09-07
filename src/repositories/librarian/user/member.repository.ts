import { count, or, ilike, eq, and, desc } from "drizzle-orm";
import { db } from "../../../db";
import { members } from "../../../db/schema";
import { withCacheAndPagination } from "../../../utils/data/repository";

export async function findMembersWithPagination(
  statusActive: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `member:status:${statusActive}:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const statusCondition =
        statusActive === "Semua"
          ? undefined
          : eq(members.status_aktif, statusActive === "true");

      const searchCondition = search
        ? or(
            ilike(members.nama, `%${search}%`),
            ilike(members.nis, `%${search}%`),
            ilike(members.email, `%${search}%`),
            ilike(members.telepon, `%${search}%`),
          )
        : undefined;

      const whereClause = and(statusCondition, searchCondition);

      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(members)
          .where(whereClause)
          .orderBy(desc(members.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(members).where(whereClause),
      ]);

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}
