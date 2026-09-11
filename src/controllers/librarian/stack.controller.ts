import { Request, Response } from "express";
import * as stackService from "@/services/librarian/stack.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";

export const getStacksHandler = async (req: Request, res: Response) => {
  try {
    const shelfId = req.params.id as string;

    if (!shelfId) {
      return res.status(400).json({
        success: false,
        message: "ID rak tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await stackService.getStacksWithPagination(
      shelfId,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getStacksHandler");
  }
};

export const showStack = async (req: Request, res: Response) => {
  try {
    const stackId = req.params.id as string;

    if (!stackId) {
      return res.status(400).json({
        success: false,
        message: "ID susunan tidak valid",
      });
    }

    const result = await stackService.getStackById(stackId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Susunan rak tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showStack");
  }
};

export const createStack = async (req: Request, res: Response) => {
  try {
    const validatedBody = req.body;
    const result = await stackService.createNewStack(validatedBody);

    return sendSuccess(res, result, "Susunan rak berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createStack");
  }
};

export const updateStack = async (req: Request, res: Response) => {
  try {
    const stackId = req.params.id as string;

    if (!stackId) {
      return res.status(400).json({
        success: false,
        message: "ID susunan tidak valid",
      });
    }

    const validatedBody = req.body;
    const result = await stackService.updateExistingStack(
      stackId,
      validatedBody,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Susunan rak tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data susunan rak berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateStack");
  }
};

export const deleteStack = async (req: Request, res: Response) => {
  try {
    const stackId = req.params.id as string;

    if (!stackId) {
      return res.status(400).json({
        success: false,
        message: "ID susunan tidak valid",
      });
    }

    const result = await stackService.deleteExistingStack(stackId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Susunan rak tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data susunan rak berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteStack");
  }
};
