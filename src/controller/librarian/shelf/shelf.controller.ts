import { Request, Response } from "express";
import * as shelfRepository from "@/repositories/librarian/shelf/shelf.repository";
import logger from "@/utils/core/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getShelfHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = getPaginationParams(req.query);

    const result = await shelfRepository.findShelvesWithPagination(
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data rak buku: search=${search}, page=${page}`,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getShelfHandler");
  }
};
