import { count, eq, and, ilike, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { librarians } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/clear-cache";

const clearLibrarianCache = async () => {
  await clearCacheByPattern("librarian:*");
};

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
      const conditions = [];

      if (statusActive !== "Semua") {
        conditions.push(eq(librarians.status_aktif, statusActive === "true"));
      }

      if (search) {
        conditions.push(
          or(
            ilike(librarians.nama, `%${search}%`),
            ilike(librarians.nip, `%${search}%`),
            ilike(librarians.email, `%${search}%`),
            ilike(librarians.telepon, `%${search}%`),
          ),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [data, countResult] = await Promise.all([
        db
          .select({
            id: librarians.id,
            nama: librarians.nama,
            nip: librarians.nip,
            email: librarians.email,
            telepon: librarians.telepon,
            foto: librarians.foto,
            status_aktif: librarians.status_aktif,
            createdAt: librarians.createdAt,
          })
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

export async function findLibrarianById(id: string) {
  const result = await db
    .select({
      id: librarians.id,
      nama: librarians.nama,
      nip: librarians.nip,
      email: librarians.email,
      telepon: librarians.telepon,
      foto: librarians.foto,
      status_aktif: librarians.status_aktif,
      createdAt: librarians.createdAt,
    })
    .from(librarians)
    .where(eq(librarians.id, id))
    .limit(1);

  return result[0] || null;
}

export async function findLibrarianRawById(id: string) {
  const result = await db
    .select()
    .from(librarians)
    .where(eq(librarians.id, id))
    .limit(1);

  return result[0] || null;
}

export const insertLibrarian = async (data: any) => {
  const result = await db.insert(librarians).values(data).returning();
  const created = result[0];

  if (created) {
    await clearLibrarianCache();
  }

  return created;
};

export const updateLibrarianById = async (id: string, data: any) => {
  const result = await db
    .update(librarians)
    .set(data)
    .where(eq(librarians.id, id))
    .returning();
  const updated = result[0] || null;

  if (updated) {
    await clearLibrarianCache();
  }

  return updated;
};

export const removeLibrarianById = async (id: string) => {
  const result = await db
    .delete(librarians)
    .where(eq(librarians.id, id))
    .returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearLibrarianCache();
  }

  return deleted;
};
