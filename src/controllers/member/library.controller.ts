import { AuthRequest } from "@/middlewares/auth.middleware";
import { sendError, sendSuccess } from "@/utils/core/handler";
import { Request, Response } from "express";
import * as libraryService from "@/services/member/library.service";

export const showBook = async (req: AuthRequest, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    const result = await libraryService.getBookById(bookId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showBook");
  }
};

export const readDigitalBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id as string;

    if (!bookId) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    const result = await libraryService.getDigitalBookById(bookId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "readDigitalBook");
  }
};

export const createBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const bookId = req.params.id as string;
    const userId = req.user?.id as string;

    if (!bookId) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    const payload = {
      bukuId: bookId,
      anggotaId: userId,
    };

    const result = await libraryService.createNewBookmark(payload);

    return sendSuccess(res, result);
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
    return sendError(res, error, "deleteStack");
  }
};
