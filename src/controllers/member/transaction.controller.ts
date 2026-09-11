import { Request, Response } from "express";
import * as transactionService from "@/services/member/transaction.service";
import { kembalikanBuku } from "@/services/member/return.service";
import { validateTransactionCreation } from "@/services/librarian/transaction-validation.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import { transactionStatusEnum } from "@/db/schema";


export const getMyTransactions = async (req: Request, res: Response) => {
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

export const showMyTransaction = async (req: Request, res: Response) => {
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

export const createMyTransaction = async (req: Request, res: Response) => {
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

    // Status "Menunggu Persetujuan" sudah di-default oleh Zod schema
    const result = await transactionService.createNewTransaction(anggotaId, validatedBody);

    return sendSuccess(res, result, "Transaksi berhasil dibuat");
  } catch (error) {
    return sendError(res, error, "createMyTransaction");
  }
};

export const returnMyTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id as string;
    const anggotaId = req.user?.id as string;
    // isBukuHilang sudah divalidasi dan di-default false oleh Zod via validate middleware
    const { isBukuHilang } = req.body as { isBukuHilang: boolean };

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi tidak valid",
      });
    }

    const result = await kembalikanBuku(transactionId, anggotaId, isBukuHilang);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data transaksi tidak ditemukan",
      });
    }

    return sendSuccess(res, result, result.pesan);
  } catch (error: any) {
    // Error 422 khusus untuk status transaksi yang tidak bisa dikembalikan
    if (error?.statusCode === 422) {
      return res.status(422).json({
        success: false,
        message: error.message,
      });
    }
    return sendError(res, error, "returnMyTransaction");
  }
};
