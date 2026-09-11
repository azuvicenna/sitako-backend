import { Request, Response } from "express";
import * as bookService from "@/services/librarian/book.service";
import { bookTypeEnum } from "@/db/schema";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import "multer";
import {
  bookCoverSchema,
  bookPdfSchema,
} from "@/validations/librarian/book.schema";

export const getBookHandler = async (req: Request, res: Response) => {
  try {
    const bookType = req.query.bookType as string;

    if (!bookType || !bookTypeEnum.enumValues.includes(bookType as any)) {
      return res.status(400).json({
        success: false,
        message: "Tipe buku tidak ditemukan atau tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);
    const result = await bookService.getBooksWithPagination(
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

export const showBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
    }

    const result = await bookService.getBookById(bookId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showBook");
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const bookTypeParam = req.query.bookType as string;

    if (
      !bookTypeParam ||
      !bookTypeEnum.enumValues.includes(bookTypeParam as any)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tipe buku tidak ditemukan atau tidak valid",
      });
    }

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const coverFile = files?.cover?.[0];
    const pdfFile = files?.file?.[0];

    const validatedBody = req.body;
    const validatedCover = bookCoverSchema.parse(coverFile);
    const validatedPdf = pdfFile ? bookPdfSchema.parse(pdfFile) : undefined;

    const result = await bookService.createNewBook(
      validatedBody,
      bookTypeParam,
      validatedCover,
      validatedPdf,
    );

    return sendSuccess(res, result, "Buku berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createBook");
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "ID Buku tidak valid",
      });
    }

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const coverFile = files?.cover?.[0];
    const pdfFile = files?.file?.[0];

    const validatedBody = req.body;
    const validatedCover = coverFile
      ? bookCoverSchema.parse(coverFile)
      : undefined;
    const validatedPdf = pdfFile ? bookPdfSchema.parse(pdfFile) : undefined;

    const result = await bookService.updateExistingBook(
      bookId,
      validatedBody,
      validatedCover,
      validatedPdf,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data buku berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateBook");
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "ID Buku tidak valid",
      });
    }

    const result = await bookService.deleteExistingBook(bookId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data buku berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteBook");
  }
};
