import { Request, Response } from "express";
import * as finePaymentService from "@/services/member/fine-payment.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getFinePaymentsHandler = async (req: Request, res: Response) => {
  try {
    const anggotaId = req.user?.id as string;
    const { page, limit, search } = getPaginationParams(req.query);

    const result = await finePaymentService.getFinePaymentsWithPagination(
      anggotaId,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getFinePaymentsHandler");
  }
};

export const showFinePayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id as string;
    const anggotaId = req.user?.id as string;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran denda tidak valid",
      });
    }

    const result = await finePaymentService.getFinePaymentById(
      paymentId,
      anggotaId,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data pembayaran denda tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showFinePayment");
  }
};
