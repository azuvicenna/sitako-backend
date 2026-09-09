import { Request, Response } from "express";
import {
  getDashboardSummaryService,
  getTodayTransactionsService,
  getWeeklyStatisticsService,
} from "@/services/librarian/dashboard.service";
import {
  sendSuccess,
  sendError,
  getPaginationParams,
} from "@/utils/core/handler";
import { transactionStatusEnum } from "@/db/schema";

export const getSummary = async (req: Request, res: Response) => {
  try {
    const result = await getDashboardSummaryService();
    return sendSuccess(res, result, "Dashboard summary retrieved");
  } catch (error) {
    return sendError(res, error, "getSummary");
  }
};

export const getTodayTransactions = async (req: Request, res: Response) => {
  try {
    const validStatuses = ["Semua", ...transactionStatusEnum.enumValues];
    const { page, limit } = getPaginationParams(req.query);
    const status = (req.query.status as string) || "Semua";

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid",
      });
    }

    const result = await getTodayTransactionsService(page, limit, status);

    return sendSuccess(res, result, "Data transaksi hari ini berhasil diambil");
  } catch (error) {
    return sendError(res, error, "getTodayTransactions");
  }
};

export const getWeeklyStatistics = async (req: Request, res: Response) => {
  try {
    const result = await getWeeklyStatisticsService();

    return sendSuccess(res, result, "Statistik mingguan berhasil diambil");
  } catch (error) {
    return sendError(res, error, "getWeeklyStatistics");
  }
};
