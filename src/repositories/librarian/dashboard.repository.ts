import { db } from "@/db";
import { books, members, transactions } from "@/db/schema";
import { eq, sql, gte, lte, and } from "drizzle-orm";
import { withCache, withCacheAndPagination } from "@/utils/data/repository";
import { clearCacheByPattern } from "@/utils/core/clear-cache";

export const invalidateDashboardCache = async () => {
  await clearCacheByPattern([
    "dashboard:summary",
    "dashboard:trx:summary",
    "dashboard:trx:table:*",
    "dashboard:statistics:weekly",
  ]);
};

export const getDashboardSummaryRepo = async () => {
  return withCache("dashboard:summary", 300, async () => {
    const [booksCount, membersCount, borrowedCount, overdueCount] =
      await Promise.all([
        db
          .select({
            fisik: sql<number>`count(case when ${books.tipeBuku} = 'Fisik' then 1 end)::int`,
            digital: sql<number>`count(case when ${books.tipeBuku} = 'Digital' then 1 end)::int`,
          })
          .from(books),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(members)
          .where(eq(members.status_aktif, true)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(transactions)
          .where(eq(transactions.status, "Dipinjam")),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(transactions)
          .where(eq(transactions.status, "Terlambat")),
      ]);

    return {
      buku: booksCount[0],
      anggotaAktif: membersCount[0].count,
      bukuDipinjam: borrowedCount[0].count,
      jatuhTempo: overdueCount[0].count,
    };
  });
};

export const getTodayTransactionsRepo = async (
  page: number,
  limit: number,
  status: string,
) => {
  const statusKey = status.replace(/\s+/g, "");
  const cacheKey = `dashboard:trx:table:${statusKey}:${page}:${limit}`;

  return withCacheAndPagination(
    cacheKey,
    page,
    limit,
    async (offset, limit) => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const baseConditions = [
        gte(transactions.createdAt, todayStart),
        lte(transactions.createdAt, todayEnd),
      ];

      if (status && status !== "Semua") {
        baseConditions.push(eq(transactions.status, status as typeof transactions.$inferSelect["status"]));
      }

      const whereClause = and(...baseConditions);

      const data = await db
        .select()
        .from(transactions)
        .where(whereClause)
        .limit(limit)
        .offset(offset);

      const totalFiltered = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(whereClause);

      return { data, total: totalFiltered[0].count };
    },
  );
};

export const getTodaySummaryRepo = async () => {
  return withCache("dashboard:trx:summary", 60, async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const summaryConditions = and(
      gte(transactions.createdAt, todayStart),
      lte(transactions.createdAt, todayEnd),
    );

    const summaryCounts = await db
      .select({
        semua: sql<number>`count(*)::int`,
        menungguPersetujuan: sql<number>`count(case when ${transactions.status} = 'Menunggu Persetujuan' then 1 end)::int`,
        dibatalkan: sql<number>`count(case when ${transactions.status} = 'Dibatalkan' then 1 end)::int`,
        menungguDiambil: sql<number>`count(case when ${transactions.status} = 'Menunggu Diambil' then 1 end)::int`,
        dipinjam: sql<number>`count(case when ${transactions.status} = 'Dipinjam' then 1 end)::int`,
        dikembalikan: sql<number>`count(case when ${transactions.status} = 'Dikembalikan' then 1 end)::int`,
        terlambat: sql<number>`count(case when ${transactions.status} = 'Terlambat' then 1 end)::int`,
        tidakMengembalikan: sql<number>`count(case when ${transactions.status} = 'Tidak Mengembalikan' then 1 end)::int`,
      })
      .from(transactions)
      .where(summaryConditions);

    return summaryCounts[0];
  });
};

export const getWeeklyStatisticsRepo = async () => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const data = await db
    .select({
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate),
      ),
    );

  return data;
};
