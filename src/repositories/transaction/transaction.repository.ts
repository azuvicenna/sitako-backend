import { count, eq, desc, and, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { books, librarians, members, transactions } from "../../db/schema";
import redisClient from "../../config/redis";
import logger from "../../utils/logger";

export async function findTransactionsWithPagination(
  status: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const cacheKey = `transaction:search:${search}:status:${status}:page:${page}:limit:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    logger.info(`Cache hit: Mengambil data dari Redis untuk key ${cacheKey}`);

    return JSON.parse(cachedData);
  }

  logger.info(`Cache miss: Mengambil data dari Database untuk key ${cacheKey}`);

  const offset = (page - 1) * limit;

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
