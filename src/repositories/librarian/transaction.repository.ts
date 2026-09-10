import { count, eq, ilike, desc, and, or } from "drizzle-orm";
import { db } from "@/db";
import { transactions, members, librarians, books } from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/clear-cache";
import { invalidateDashboardCache } from "./dashboard.repository";

export type TransactionInsert = typeof transactions.$inferInsert;
export type TransactionSelect = typeof transactions.$inferSelect;

const clearTransactionCache = async () => {
  await clearCacheByPattern(`transaction:*`);
  await invalidateDashboardCache();
};

export async function findTransactionsWithPagination(
  status: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `transaction:search:${search}:status:${status}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const searchCondition = search
        ? or(
            ilike(transactions.kdTransaksi, `%${search}%`),
            ilike(members.nama, `%${search}%`),
            ilike(librarians.nama, `%${search}%`),
            ilike(books.judul, `%${search}%`),
          )
        : undefined;

      const whereClause = and(
        status === "Semua" ? undefined : eq(transactions.status, status as TransactionSelect["status"]),
        searchCondition,
      );

      const [data, countResult] = await Promise.all([
        db
          .select({
            id: transactions.id,
            kdTransaksi: transactions.kdTransaksi,
            tglPinjam: transactions.tglPinjam,
            tglKembali: transactions.tglKembali,
            status: transactions.status,
            namaAnggota: members.nama,
            namaPustakawan: librarians.nama,
            judulBuku: books.judul,
          })
          .from(transactions)
          .innerJoin(members, eq(transactions.anggotaId, members.id))
          .innerJoin(librarians, eq(transactions.pustakawanId, librarians.id))
          .innerJoin(books, eq(transactions.bukuId, books.id))
          .where(whereClause)
          .orderBy(desc(transactions.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ total: count() })
          .from(transactions)
          .innerJoin(members, eq(transactions.anggotaId, members.id))
          .innerJoin(librarians, eq(transactions.pustakawanId, librarians.id))
          .innerJoin(books, eq(transactions.bukuId, books.id))
          .where(whereClause),
      ]);

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}

export async function findTransaction(
  id: string,
): Promise<TransactionSelect | null> {
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);
  return result[0] || null;
}

export const insertTransaction = async (
  data: TransactionInsert,
): Promise<TransactionSelect> => {
  const result = await db.insert(transactions).values(data).returning();
  const created = result[0];

  if (created) {
    await clearTransactionCache();
  }

  return created;
};

export const updateTransactionById = async (
  id: string,
  data: Partial<TransactionInsert>,
): Promise<TransactionSelect | null> => {
  const result = await db
    .update(transactions)
    .set(data)
    .where(eq(transactions.id, id))
    .returning();

  const updated = result[0] || null;

  if (updated) {
    await clearTransactionCache();
  }

  return updated;
};

export const removeTransactionById = async (
  id: string,
): Promise<TransactionSelect | null> => {
  const result = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearTransactionCache();
  }

  return deleted;
};
