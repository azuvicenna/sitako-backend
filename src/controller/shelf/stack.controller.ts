import { Request, Response } from "express";
import * as stackRepository from "../../repositories/shelf/stack.repository";
import logger from "../../utils/logger";

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

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const result = await stackRepository.findStacksWithPagination(
      shelfId,
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data susunan rak: rak_id=${shelfId}, search=${search}, page=${page}`,
    );

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error(
      `Error pada getStackHandler: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
