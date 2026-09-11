import { Request, Response } from "express";
import * as librarianService from "@/services/librarian/librarian.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import {
  imageFileSchema,
} from "@/validations/librarian/librarian.schema";

export const getLibrarianHandler = async (req: Request, res: Response) => {
  try {
    const statusActive = req.query.statusActive as string;

    if (!statusActive || !["Semua", "true", "false"].includes(statusActive)) {
      return res.status(400).json({
        success: false,
        message: "Status aktif tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await librarianService.getLibrariansWithPagination(
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

export const showLibrarian = async (req: Request, res: Response) => {
  try {
    const librarianId = req.params.id as string;

    if (!librarianId) {
      return res.status(400).json({
        success: false,
        message: "ID pustakawan tidak valid",
      });
    }

    const result = await librarianService.getLibrarianById(librarianId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pustakawan tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showLibrarian");
  }
};

export const createLibrarian = async (req: Request, res: Response) => {
  try {
    const validatedBody = req.body;
    const validatedFile = imageFileSchema.parse(req.file);

    const result = await librarianService.createNewLibrarian(
      validatedBody,
      validatedFile,
    );

    return sendSuccess(res, result, "Pustakawan berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createLibrarian");
  }
};

export const updateLibrarian = async (req: Request, res: Response) => {
  try {
    const librarianId = req.params.id as string;

    if (!librarianId) {
      return res.status(400).json({
        success: false,
        message: "ID pustakawan tidak valid",
      });
    }

    const validatedBody = req.body;
    const validatedFile = req.file
      ? imageFileSchema.parse(req.file)
      : undefined;

    const result = await librarianService.updateExistingLibrarian(
      librarianId,
      validatedBody,
      validatedFile,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pustakawan tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data pustakawan berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateLibrarian");
  }
};

export const deleteLibrarian = async (req: Request, res: Response) => {
  try {
    const librarianId = req.params.id as string;

    if (!librarianId) {
      return res.status(400).json({
        success: false,
        message: "ID pustakawan tidak valid",
      });
    }

    const result = await librarianService.deleteExistingLibrarian(librarianId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Pustakawan tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data pustakawan berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteLibrarian");
  }
};
