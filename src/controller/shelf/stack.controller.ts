import { Request, Response } from "express";
import * as stackRepository from "../../repositories/shelf/stack.repository";

export const getStackHandler = async (req: Request, res: Response) => {
  try {
    const shelfId = req.params.id as string;

    if (!shelfId) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

    const result = await stackRepository.findStackesWithPagination(
      shelfId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
