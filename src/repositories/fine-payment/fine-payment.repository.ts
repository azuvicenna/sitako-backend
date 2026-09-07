import { count, desc, or, ilike, sql, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  books,
  finePayments,
  librarians,
  members,
  transactions,
} from "../../db/schema";
import { withCacheAndPagination } from "../../utils/repository";

export async function findFinePaymentWithPagination(
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
