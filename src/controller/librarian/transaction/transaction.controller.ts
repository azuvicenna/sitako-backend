import { Request, Response } from "express";
import * as transactionRepository from "@/repositories/librarian/transaction/transaction.repository";
import { transactionStatusEnum } from "@/db/schema";
import logger from "@/utils/core/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getTransactionHandler = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as string;

    if (
      !status ||
      (status !== "Semua" &&
        !transactionStatusEnum.enumValues.includes(status as any))
    ) {
      logger.warn(
        `Pencarian gagal: Parameter atau tipe transaksi tidak valid - ${status}`,
      );

      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await transactionRepository.findTransactionsWithPagination(
      status,
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data transaksi: status=${status}, search=${search}, page=${page}`,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getTransactionHandler");
  }
};
