import { Request, Response } from "express";
import * as memberService from "@/services/librarian/member.service";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "@/utils/core/handler";
import { imageFileSchema } from "@/validations/librarian/librarian.schema";

export const getMemberHandler = async (req: Request, res: Response) => {
  try {
    const statusActive = req.query.statusActive as string;

    if (!statusActive || !["Semua", "true", "false"].includes(statusActive)) {
      return res.status(400).json({
        success: false,
        message: "Status aktif tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await memberService.getMembersWithPagination(
      statusActive,
      page,
      limit,
      search,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getMemberHandler");
  }
};

export const showMember = async (req: Request, res: Response) => {
  try {
    const memberId = req.params.id as string;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "ID anggota tidak valid",
      });
    }

    const result = await memberService.getMemberById(memberId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "showMember");
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const validatedBody = req.body;
    const validatedFile = imageFileSchema.parse(req.file);

    const result = await memberService.createNewMember(
      validatedBody,
      validatedFile,
    );

    return sendSuccess(res, result, "Anggota berhasil ditambahkan");
  } catch (error) {
    return sendError(res, error, "createMember");
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const memberId = req.params.id as string;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "ID anggota tidak valid",
      });
    }

    const validatedBody = req.body;
    const validatedFile = req.file
      ? imageFileSchema.parse(req.file)
      : undefined;

    const result = await memberService.updateExistingMember(
      memberId,
      validatedBody,
      validatedFile,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data anggota berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateMember");
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const memberId = req.params.id as string;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "ID anggota tidak valid",
      });
    }

    const result = await memberService.deleteExistingMember(memberId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Data anggota berhasil dihapus");
  } catch (error) {
    return sendError(res, error, "deleteMember");
  }
};
