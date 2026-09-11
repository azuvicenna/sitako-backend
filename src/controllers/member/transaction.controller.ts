import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import * as transactionService from "@/services/member/transaction.service";
import { validateTransactionCreation } from "@/services/transaction.validation.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import { transactionStatusEnum } from "@/db/schema";


export const getMyTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const anggotaId = req.user?.id as string;

    if (
      !status ||
      (status !== "Semua" &&
        !transactionStatusEnum.enumValues.includes(status as any))
    ) {
      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await transactionService.getTransactionsWithPagination(
      anggotaId,
      status,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getMyTransactions");
  }
};

export const showMyTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionId = req.params.id as string;
    const anggotaId = req.user?.id as string;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
      });
    }

    const result = await transactionService.getTransactionById(transactionId, anggotaId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data transaksi tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showMyTransaction");
  }
};

export const createMyTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const validatedBody = req.body;
    const anggotaId = req.user?.id as string;
    
    const validationResult = await validateTransactionCreation(anggotaId, validatedBody.bukuId);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    validatedBody.status = "Menunggu Persetujuan";
    const result = await transactionService.createNewTransaction(anggotaId, validatedBody);

    return sendSuccess(res, result, "Transaksi berhasil dibuat");
  } catch (error) {
    return sendError(res, error, "createMyTransaction");
  }
};
