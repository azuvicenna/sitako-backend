import { Request, Response } from "express";
import * as bookRepository from "../../repositories/book/book.repository";
import { bookTypeEnum } from "../../db/schema";
import logger from "../../utils/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "../../utils/handler";

export const getBookHandler = async (req: Request, res: Response) => {
  try {
    const bookType = req.params.bookType as string;

    if (!bookType || !bookTypeEnum.enumValues.includes(bookType as any)) {
      logger.warn(
        `Pencarian gagal: Tipe buku kosong atau tidak valid - ${bookType}`,
      );

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

    logger.info(
      `Memproses request data buku: tipe=${bookType}, search=${search}, page=${page}`,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getBookHandler");
  }
};
