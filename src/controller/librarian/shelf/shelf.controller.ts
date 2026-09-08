import { Request, Response } from "express";
import * as shelfRepository from "@/repositories/librarian/shelf/shelf.repository";
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

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getShelfHandler");
  }
};
