import { count, desc, or, ilike, sql, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  books,
  finePayments,
  librarians,
  members,
  transactions,
} from "../../db/schema";
import redisClient from "../../config/redis";
import logger from "../../utils/logger";

export async function findFinePaymentWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `fine-payment:search:${search}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    logger.info(`Cache hit: Mengambil data dari Redis untuk key ${cacheKey}`);

    return JSON.parse(cachedData);
  }

  logger.info(`Cache miss: Mengambil data dari Database untuk key ${cacheKey}`);

  const offset = (page - 1) * limit;

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
      .innerJoin(transactions, eq(finePayments.transaksiId, transactions.id))
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
      .innerJoin(transactions, eq(finePayments.transaksiId, transactions.id))
      .innerJoin(books, eq(transactions.bukuId, books.id))
      .where(whereClause),
  ]);

  const totalRows = Number(countResult[0]?.total ?? 0);
  const totalPages = Math.ceil(totalRows / limit);

  const result = {
    data,
    meta: {
      page,
      limit,
      totalRows,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

  logger.info(`Data baru berhasil disimpan ke Redis untuk key ${cacheKey}`);

  return result;
}
