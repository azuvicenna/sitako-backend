import { Request, Response } from "express";
import * as fineRepository from "../../repositories/fine/fine.repository";
import logger from "../../utils/logger";

export const getFineHandler = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const result = await fineRepository.findFinesWithPagination(
      page,
      limit,
      search,
    );

    logger.info(`Memproses request data denda: search=${search}, page=${page}`);

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error(
      `Error pada getFineHandler: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
