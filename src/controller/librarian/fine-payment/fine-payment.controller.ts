import { Request, Response } from "express";
import * as paymentHistoryRepository from "../../../repositories/librarian/fine-payment/fine-payment.repository";
import logger from "../../../utils/core/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "../../../utils/core/handler";

export const getFinePaymentHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = getPaginationParams(req.query);

    const result = await paymentHistoryRepository.findFinePaymentWithPagination(
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data pembayaran denda: search=${search}, page=${page}`,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getFinePaymentHandler");
  }
};
