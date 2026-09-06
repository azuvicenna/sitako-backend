import { Request, Response } from "express";
import * as bookRepository from "../../repositories/book/book.repository";
import { bookTypeEnum } from "../../db/schema";

export const getBookHandler = async (req: Request, res: Response) => {
  try {
    const bookType = req.params.bookType as string;

    if (!bookType) {
      return res.status(400).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    if (!bookTypeEnum.enumValues.includes(bookType as any)) {
      return res.status(400).json({
        success: false,
        message: "Tipe buku tidak valid",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const result = await bookRepository.findBooksWithPagination(bookType, page, limit, search);

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
