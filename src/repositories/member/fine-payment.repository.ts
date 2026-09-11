import { count, eq, or, ilike, desc, and, sql } from "drizzle-orm";
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

export type FinePaymentSelect = typeof finePayments.$inferSelect;

const clearMemberFinePaymentCache = async (anggotaId: string) => {
  await clearCacheByPattern(`member-fine-payment:anggota:${anggotaId}:*`);
};

export async function findFinePaymentsWithPagination(
  anggotaId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `member-fine-payment:anggota:${anggotaId}:search:${search}:page:${page}:limit:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const searchCondition = search
        ? or(
            ilike(
              sql`CAST(${finePayments.metodePembayaran} AS TEXT)`,
              `%${search}%`,
            ),
            ilike(transactions.kdTransaksi, `%${search}%`),
            ilike(books.judul, `%${search}%`),
            ilike(librarians.nama, `%${search}%`),
          )
        : undefined;

      const whereClause = and(
        eq(finePayments.anggotaId, anggotaId),
        searchCondition,
      );

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

/**
 * Mengambil detail satu pembayaran denda dengan ownership guard —
 * anggota hanya bisa melihat pembayaran miliknya sendiri.
 */
export async function findFinePayment(id: string, anggotaId: string) {
  const result = await db
    .select({
      id: finePayments.id,
      hargaDenda: finePayments.hargaDenda,
      totalDenda: finePayments.totalDenda,
      tglBayar: finePayments.tglBayar,
      metodePembayaran: finePayments.metodePembayaran,
      createdAt: finePayments.createdAt,
      namaPustakawan: librarians.nama,
      kdTransaksi: transactions.kdTransaksi,
      judulBuku: books.judul,
      tglPinjam: transactions.tglPinjam,
      tglKembali: transactions.tglKembali,
      statusTransaksi: transactions.status,
    })
    .from(finePayments)
    .innerJoin(librarians, eq(finePayments.pustakawanId, librarians.id))
    .innerJoin(members, eq(finePayments.anggotaId, members.id))
    .innerJoin(transactions, eq(finePayments.transaksiId, transactions.id))
    .innerJoin(books, eq(transactions.bukuId, books.id))
    .where(
      and(
        eq(finePayments.id, id),
        // Ownership guard: pastikan pembayaran ini memang milik anggota yang request
        eq(finePayments.anggotaId, anggotaId),
      ),
    )
    .limit(1);

  return result[0] || null;
}
