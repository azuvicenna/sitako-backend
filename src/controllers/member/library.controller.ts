import { Request, Response } from "express";
import { sendError, sendSuccess } from "@/utils/core/handler";
import * as libraryService from "@/services/member/library.service";

export const showBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
    }

    const result = await libraryService.getBookById(bookId);

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

export const readDigitalBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
    }

    const result = await libraryService.getDigitalBookById(bookId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Buku digital tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "readDigitalBook");
  }
};

export const createBookmark = async (req: Request, res: Response) => {
  try {
    // req.body sudah divalidasi oleh validate(createBookmarkSchema) di route
    // bukuId juga ada di params, anggotaId dari JWT — kita override body dengan nilai yang benar
    const bookId = req.params.id as string;
    const userId = req.user?.id as string;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "ID buku tidak valid",
      });
    }

    const payload = {
      bukuId: bookId,
      anggotaId: userId,
    };

    const result = await libraryService.createNewBookmark(payload);

    return sendSuccess(res, result, "Bookmark berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createBookmark");
  }
};

export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const bookmarkId = req.params.bookmarkId as string;

    if (!bookmarkId) {
      return res.status(400).json({
        success: false,
        message: "ID bookmark tidak valid",
      });
    }

    const result = await libraryService.deleteExistingBookmark(bookmarkId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Bookmark tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data bookmark berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteBookmark");
  }
};
