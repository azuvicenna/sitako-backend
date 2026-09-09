import {
  getDashboardSummaryRepo,
  getTodaySummaryRepo,
  getTodayTransactionsRepo,
  getWeeklyStatisticsRepo,
} from "@/repositories/librarian/dashboard.repository";
import { withCache } from "@/utils/data/repository";

export const getDashboardSummaryService = async () => {
  return getDashboardSummaryRepo();
};

export const getTodayTransactionsService = async (
  page: number,
  limit: number,
  status: string,
) => {
  const statusKey = status || "Semua";

  const [paginatedData, summaryData] = await Promise.all([
    getTodayTransactionsRepo(page, limit, statusKey),
    getTodaySummaryRepo(),
  ]);

  return {
    ...paginatedData,
    summary: summaryData,
  };
};

export const getWeeklyStatisticsService = async () => {
  return withCache("dashboard:statistics:weekly", 300, async () => {
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

    return {
      statistik: stats,
      rataRata,
    };
  });
};
