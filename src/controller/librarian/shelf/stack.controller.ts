import { Request, Response } from "express";
import * as stackRepository from "@/repositories/librarian/shelf/stack.repository";
import logger from "@/utils/core/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getStackHandler = async (req: Request, res: Response) => {
  try {
    const shelfId = req.params.id as string;

    if (!shelfId) {
      logger.warn("Pencarian gagal: Parameter rak id kosong");

      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await stackRepository.findStacksWithPagination(
      shelfId,
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data susunan rak: rak_id=${shelfId}, search=${search}, page=${page}`,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getStackHandler");
  }
};
