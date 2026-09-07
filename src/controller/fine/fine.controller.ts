import { Request, Response } from "express";
import * as fineRepository from "../../repositories/fine/fine.repository";
import logger from "../../utils/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "../../utils/handler";

export const getFineHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = getPaginationParams(req.query);

    const result = await fineRepository.findFinesWithPagination(
      page,
      limit,
      search,
    );

    logger.info(`Memproses request data denda: search=${search}, page=${page}`);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getFineHandler");
  }
};
