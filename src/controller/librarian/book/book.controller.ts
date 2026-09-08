import { Request, Response } from "express";
import * as bookRepository from "@/repositories/librarian/book/book.repository";
import { bookTypeEnum } from "@/db/schema";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getBookHandler = async (req: Request, res: Response) => {
  try {
    const bookType = req.params.bookType as string;

    if (!bookType || !bookTypeEnum.enumValues.includes(bookType as any)) {
      return res.status(400).json({
        success: false,
        message: "Tipe buku tidak ditemukan atau tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await bookRepository.findBooksWithPagination(
      bookType,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getBookHandler");
  }
};
