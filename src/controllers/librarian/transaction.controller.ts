import { Request, Response } from "express";
import * as transactionService from "@/services/librarian/transaction.service";
import { validateTransactionCreation } from "@/services/transaction.validation.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import { transactionStatusEnum } from "@/db/schema";


export const getTransactionsHandler = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;

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
      status,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getTransactionsHandler");
  }
};

export const showTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id as string;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
      });
    }

    const result = await transactionService.getTransactionById(transactionId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data transaksi tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showTransaction");
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const validatedBody = req.body;
    
    const validationResult = await validateTransactionCreation(validatedBody.anggotaId, validatedBody.bukuId);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    validatedBody.status = "Dipinjam";
    const result = await transactionService.createNewTransaction(validatedBody);

    return sendSuccess(res, result, "Transaksi berhasil dibuat");
  } catch (error) {
    return sendError(res, error, "createTransaction");
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id as string;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
      });
    }

    const validatedBody = req.body;
    const result = await transactionService.updateExistingTransaction(
      transactionId,
      validatedBody,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data transaksi tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data transaksi berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateTransaction");
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id as string;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
      });
    }

    const result =
      await transactionService.deleteExistingTransaction(transactionId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data transaksi tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data transaksi berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteTransaction");
  }
};
