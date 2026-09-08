import { Request, Response } from "express";
import * as librarianRepository from "@/repositories/librarian/user/librarian.repository";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getLibrarianHandler = async (req: Request, res: Response) => {
  try {
    const statusActive = req.params.statusActive as string;

    if (!statusActive || !["Semua", "true", "false"].includes(statusActive)) {
      return res.status(400).json({
        success: false,
        message: "Status aktif tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await librarianRepository.findLibrariansWithPagination(
      statusActive,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getLibrarianHandler");
  }
};
