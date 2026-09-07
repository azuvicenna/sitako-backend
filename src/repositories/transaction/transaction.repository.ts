import { count, eq, desc, and, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { books, librarians, members, transactions } from "../../db/schema";
import redisClient from "../../config/redis";
import logger from "../../utils/logger";
import { withCacheAndPagination } from "../../utils/repository";

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
        status === "Semua" ? undefined : eq(transactions.status, status as any),
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
