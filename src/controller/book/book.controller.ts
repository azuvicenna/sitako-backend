import { Request, Response } from "express";
import * as bookRepository from "../../repositories/book/book.repository";
import { bookTypeEnum } from "../../db/schema";
import logger from "../../utils/logger";

export const getBookHandler = async (req: Request, res: Response) => {
  try {
    const bookType = req.params.bookType as string;

    if (!bookType) {
      logger.warn("Pencarian gagal: Parameter tipe buku kosong");

      return res.status(400).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    if (!bookTypeEnum.enumValues.includes(bookType as any)) {
      logger.warn(`Pencarian gagal: Tipe buku tidak valid - ${bookType}`);

      return res.status(400).json({
        success: false,
        message: "Tipe buku tidak valid",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const result = await bookRepository.findBooksWithPagination(
      bookType,
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data buku: tipe=${bookType}, search=${search}, page=${page}`,
    );

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error(
      `Error pada getBookHandler: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
