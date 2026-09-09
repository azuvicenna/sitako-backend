import { Request, Response } from "express";
import * as fineService from "@/services/librarian/fine/fine.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import { createFineSchema, updateFineSchema } from "@/validations/fine.schema";

export const getFinesHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = getPaginationParams(req.query);
    const result = await fineService.getFinesWithPagination(
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getFinesHandler");
  }
};

export const showFine = async (req: Request, res: Response) => {
  try {
    const fineId = req.params.id as string;

    if (!fineId) {
      return res.status(400).json({
        success: false,
        message: "ID denda tidak valid",
      });
    }

    const result = await fineService.getFineById(fineId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Denda tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showFine");
  }
};

export const createFine = async (req: Request, res: Response) => {
  try {
    const validatedBody = createFineSchema.parse(req.body);
    const result = await fineService.createNewFine(validatedBody);

    return sendSuccess(res, result, "Denda berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createFine");
  }
};

export const updateFine = async (req: Request, res: Response) => {
  try {
    const fineId = req.params.id as string;

    if (!fineId) {
      return res.status(400).json({
        success: false,
        message: "ID Denda tidak valid",
      });
    }

    const validatedBody = updateFineSchema.parse(req.body);
    const result = await fineService.updateExistingFine(fineId, validatedBody);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Denda tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data denda berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateFine");
  }
};

export const deleteFine = async (req: Request, res: Response) => {
  try {
    const fineId = req.params.id as string;

    if (!fineId) {
      return res.status(400).json({
        success: false,
        message: "ID Denda tidak valid",
      });
    }

    const result = await fineService.deleteExistingFine(fineId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Denda tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data denda berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteFine");
  }
};
