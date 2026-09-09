import { Request, Response } from "express";
import * as finePaymentService from "@/services/librarian/fine-payment.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import {
  createFinePaymentSchema,
  updateFinePaymentSchema,
} from "@/validations/librarian/fine-payment.schema";

export const getFinePaymentsHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = getPaginationParams(req.query);
    const result = await finePaymentService.getFinePaymentsWithPagination(
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

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran denda tidak valid",
      });
    }

    const result = await finePaymentService.getFinePaymentById(paymentId);

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

export const createFinePayment = async (req: Request, res: Response) => {
  try {
    const validatedBody = createFinePaymentSchema.parse(req.body);
    const result = await finePaymentService.createNewFinePayment(validatedBody);

    return sendSuccess(res, result, "Pembayaran denda berhasil dicatat");
  } catch (error) {
    return sendError(res, error, "createFinePayment");
  }
};

export const updateFinePayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id as string;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran denda tidak valid",
      });
    }

    const validatedBody = updateFinePaymentSchema.parse(req.body);
    const result = await finePaymentService.updateExistingFinePayment(
      paymentId,
      validatedBody,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data pembayaran denda tidak ditemukan",
      });
    }

    return sendSuccess(
      res,
      result,
      "Data pembayaran denda berhasil diperbarui",
    );
  } catch (error) {
    return sendError(res, error, "updateFinePayment");
  }
};

export const deleteFinePayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id as string;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran denda tidak valid",
      });
    }

    const result =
      await finePaymentService.deleteExistingFinePayment(paymentId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Data pembayaran denda tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data pembayaran denda berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteFinePayment");
  }
};
