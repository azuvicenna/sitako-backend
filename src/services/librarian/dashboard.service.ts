import {
  getDashboardSummaryRepo,
  getTodaySummaryRepo,
  getTodayTransactionsRepo,
  getWeeklyStatisticsRepo,
} from "@/repositories/librarian/dashboard.repository";
import redisClient from "@/config/redis";
import { withCacheAndPagination } from "@/utils/data/repository";

export const getDashboardSummaryService = async () => {
  const cacheKey = "dashboard:summary";
  const cached = await redisClient.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const data = await getDashboardSummaryRepo();
  await redisClient.setEx(cacheKey, 300, JSON.stringify(data));

  return data;
};

export const getTodayTransactionsService = async (
  page: number,
  limit: number,
  status: string,
) => {
  const statusKey = status || "Semua";
  const tableCacheKey = `dashboard:trx:table:${statusKey.replace(/\s+/g, "")}:${page}:${limit}`;
  const summaryCacheKey = `dashboard:trx:summary`;

  const paginatedData = await withCacheAndPagination(
    tableCacheKey,
    page,
    limit,
    (offset, lmt) => getTodayTransactionsRepo(offset, lmt, statusKey),
  );

  let summaryData;
  const cachedSummary = await redisClient.get(summaryCacheKey);

  if (cachedSummary) {
    summaryData = JSON.parse(cachedSummary);
  } else {
    summaryData = await getTodaySummaryRepo();
    await redisClient.setEx(summaryCacheKey, 60, JSON.stringify(summaryData));
  }

  return {
    ...paginatedData,
    summary: summaryData,
  };
};

export const getWeeklyStatisticsService = async () => {
  const cacheKey = "dashboard:statistics:weekly";
  const cached = await redisClient.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const rawData = await getWeeklyStatisticsRepo();

  const stats = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));

    const day = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
    }).format(d);

    return {
      tanggal: d.toISOString().split("T")[0],
      hari: day,
      total: 0,
    };
  });

  let totalPeminjaman = 0;

  rawData.forEach((trx) => {
    const dateStr = trx.createdAt.toISOString().split("T")[0];
    const dayStat = stats.find((s) => s.tanggal === dateStr);

    if (dayStat) {
      dayStat.total += 1;
      totalPeminjaman += 1;
    }
  });

  const rataRata = Math.round(totalPeminjaman / 7);

  const result = {
    statistik: stats,
    rataRata,
  };

  await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

  return result;
};
