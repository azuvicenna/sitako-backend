import { Request, Response } from "express";
import * as transactionRepository from "../../repositories/transaction/transaction.repository";
import { transactionStatusEnum } from "../../db/schema";
import logger from "../../utils/logger";

export const getTransactionHandler = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as string;

    if (!status) {
      logger.warn("Pencarian gagal: Parameter status kosong");

      return res.status(400).json({
        success: false,
        message: "Status tidak ditemukan",
      });
    }

    if (
      status !== "Semua" &&
      !transactionStatusEnum.enumValues.includes(status as any)
    ) {
      logger.warn(`Pencarian gagal: Tipe transaksi tidak valid - ${status}`);

      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const result = await transactionRepository.findTransactionsWithPagination(
      status,
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data transaksi: status=${status}, search=${search}, page=${page}`,
    );

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error(
      `Error pada getTransactionHandler: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
