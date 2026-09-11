import { count, eq, and, ilike, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/cache";
import { invalidateDashboardCache } from "./dashboard.repository";

export type MemberInsert = typeof members.$inferInsert;
export type MemberSelect = typeof members.$inferSelect;

const clearMemberCache = async () => {
  await clearCacheByPattern("member:*");
  await invalidateDashboardCache();
};

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
      const conditions = [];

      if (statusActive !== "Semua") {
        conditions.push(eq(members.status_aktif, statusActive === "true"));
      }

      if (search) {
        conditions.push(
          or(
            ilike(members.nama, `%${search}%`),
            ilike(members.nis, `%${search}%`),
            ilike(members.email, `%${search}%`),
            ilike(members.telepon, `%${search}%`),
          ),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [data, countResult] = await Promise.all([
        db
          .select({
            id: members.id,
            nama: members.nama,
            nis: members.nis,
            email: members.email,
            telepon: members.telepon,
            foto: members.foto,
            status_aktif: members.status_aktif,
            createdAt: members.createdAt,
          })
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

export async function findMemberById(id: string) {
  const result = await db
    .select({
      id: members.id,
      nama: members.nama,
      nis: members.nis,
      email: members.email,
      telepon: members.telepon,
      foto: members.foto,
      status_aktif: members.status_aktif,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  return result[0] || null;
}

export async function findMemberRawById(id: string) {
  const result = await db
    .select()
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  return result[0] || null;
}

export const insertMember = async (
  data: MemberInsert,
): Promise<MemberSelect> => {
  const result = await db.insert(members).values(data).returning();
  const created = result[0];

  if (created) {
    await clearMemberCache();
  }

  return created;
};

export const updateMemberById = async (
  id: string,
  data: Partial<MemberInsert>,
): Promise<MemberSelect | null> => {
  const result = await db
    .update(members)
    .set(data)
    .where(eq(members.id, id))
    .returning();
  const updated = result[0] || null;

  if (updated) {
    await clearMemberCache();
  }

  return updated;
};

export const removeMemberById = async (id: string) => {
  const result = await db.delete(members).where(eq(members.id, id)).returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearMemberCache();
  }

  return deleted;
};
