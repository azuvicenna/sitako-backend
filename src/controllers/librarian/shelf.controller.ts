import { Request, Response } from "express";
import * as shelfService from "@/services/librarian/shelf.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import {
  createShelfSchema,
  updateShelfSchema,
} from "@/validations/librarian/shelf.schema";

export const getShelvesHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = getPaginationParams(req.query);
    const result = await shelfService.getShelvesWithPagination(
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getShelvesHandler");
  }
};

export const showShelf = async (req: Request, res: Response) => {
  try {
    const shelfId = req.params.id as string;

    if (!shelfId) {
      return res.status(400).json({
        success: false,
        message: "ID rak buku tidak valid",
      });
    }

    const result = await shelfService.getShelfById(shelfId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Rak buku tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showShelf");
  }
};

export const createShelf = async (req: Request, res: Response) => {
  try {
    const validatedBody = createShelfSchema.parse(req.body);
    const result = await shelfService.createNewShelf(validatedBody);

    return sendSuccess(res, result, "Rak buku berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createShelf");
  }
};

export const updateShelf = async (req: Request, res: Response) => {
  try {
    const shelfId = req.params.id as string;

    if (!shelfId) {
      return res.status(400).json({
        success: false,
        message: "ID Rak buku tidak valid",
      });
    }

    const validatedBody = updateShelfSchema.parse(req.body);
    const result = await shelfService.updateExistingShelf(
      shelfId,
      validatedBody,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Rak buku tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data rak buku berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateShelf");
  }
};

export const deleteShelf = async (req: Request, res: Response) => {
  try {
    const shelfId = req.params.id as string;

    if (!shelfId) {
      return res.status(400).json({
        success: false,
        message: "ID Rak buku tidak valid",
      });
    }

    const result = await shelfService.deleteExistingShelf(shelfId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Rak buku tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data rak buku berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteShelf");
  }
};
