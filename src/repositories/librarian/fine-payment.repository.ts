import { count, eq, or, ilike, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  finePayments,
  librarians,
  members,
  transactions,
  books,
} from "@/db/schema";
import { withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/cache";

export type FinePaymentInsert = typeof finePayments.$inferInsert;
export type FinePaymentSelect = typeof finePayments.$inferSelect;

const clearFinePaymentCache = async () => {
  await clearCacheByPattern(`fine-payment:*`);
};

export async function findFinePaymentsWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `fine-payment:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const whereClause = search
        ? or(
            ilike(sql`CAST(${finePayments.hargaDenda} AS TEXT)`, `%${search}%`),
            ilike(sql`CAST(${finePayments.totalDenda} AS TEXT)`, `%${search}%`),
            ilike(
              sql`CAST(${finePayments.metodePembayaran} AS TEXT)`,
              `%${search}%`,
            ),
            ilike(members.nama, `%${search}%`),
            ilike(librarians.nama, `%${search}%`),
            ilike(transactions.kdTransaksi, `%${search}%`),
            ilike(books.judul, `%${search}%`),
          )
        : undefined;

      const [data, countResult] = await Promise.all([
        db
          .select({
            id: finePayments.id,
            hargaDenda: finePayments.hargaDenda,
            totalDenda: finePayments.totalDenda,
            tglBayar: finePayments.tglBayar,
            metodePembayaran: finePayments.metodePembayaran,
            createdAt: finePayments.createdAt,
            namaPustakawan: librarians.nama,
            namaAnggota: members.nama,
            kdTransaksi: transactions.kdTransaksi,
            judulBuku: books.judul,
          })
          .from(finePayments)
          .innerJoin(librarians, eq(finePayments.pustakawanId, librarians.id))
          .innerJoin(members, eq(finePayments.anggotaId, members.id))
          .innerJoin(
            transactions,
            eq(finePayments.transaksiId, transactions.id),
          )
          .innerJoin(books, eq(transactions.bukuId, books.id))
          .where(whereClause)
          .orderBy(desc(finePayments.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ total: count() })
          .from(finePayments)
          .innerJoin(librarians, eq(finePayments.pustakawanId, librarians.id))
          .innerJoin(members, eq(finePayments.anggotaId, members.id))
          .innerJoin(
            transactions,
            eq(finePayments.transaksiId, transactions.id),
          )
          .innerJoin(books, eq(transactions.bukuId, books.id))
          .where(whereClause),
      ]);

      return { data, total: Number(countResult[0]?.total ?? 0) };
    },
  );
}

export async function findFinePayment(
  id: string,
): Promise<FinePaymentSelect | null> {
  const result = await db
    .select()
    .from(finePayments)
    .where(eq(finePayments.id, id))
    .limit(1);
  return result[0] || null;
}

export const insertFinePayment = async (
  data: FinePaymentInsert,
): Promise<FinePaymentSelect> => {
  const result = await db.insert(finePayments).values(data).returning();
  const created = result[0];

  if (created) {
    await clearFinePaymentCache();
  }

  return created;
};

export const updateFinePaymentById = async (
  id: string,
  data: Partial<FinePaymentInsert>,
): Promise<FinePaymentSelect | null> => {
  const result = await db
    .update(finePayments)
    .set(data)
    .where(eq(finePayments.id, id))
    .returning();

  const updated = result[0] || null;

  if (updated) {
    await clearFinePaymentCache();
  }

  return updated;
};

export const removeFinePaymentById = async (
  id: string,
): Promise<FinePaymentSelect | null> => {
  const result = await db
    .delete(finePayments)
    .where(eq(finePayments.id, id))
    .returning();
  const deleted = result[0] || null;

  if (deleted) {
    await clearFinePaymentCache();
  }

  return deleted;
};
