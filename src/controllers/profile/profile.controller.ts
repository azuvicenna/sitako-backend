import { sendError, sendSuccess } from "@/utils/core/handler";
import { Request, Response } from "express";
import * as librarianService from "@/services/librarian/librarian.service";
import * as memberService from "@/services/librarian/member.service";
import {
  imageFileSchema,
  updateLibrarianSchema,
} from "@/validations/librarian/librarian.schema";
import { updateMemberSchema } from "@/validations/librarian/member.schema";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid",
      });
    }

    let result;

    if (userRole === "Pustakawan") {
      result = await librarianService.getLibrarianById(userId);
    } else if (userRole === "Anggota") {
      result = await memberService.getMemberById(userId);
    } else {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Profil tidak ditemukan",
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getMyProfile");
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Sesi tidak valid",
      });
    }

    let result;
    const validatedFile = req.file
      ? imageFileSchema.parse(req.file)
      : undefined;

    if (userRole === "Pustakawan") {
      const validatedBody = updateLibrarianSchema.parse(req.body);
      result = await librarianService.updateExistingLibrarian(
        userId,
        validatedBody,
        validatedFile,
      );
    } else if (userRole === "Anggota") {
      const validatedBody = updateMemberSchema.parse(req.body);
      result = await memberService.updateExistingMember(
        userId,
        validatedBody,
        validatedFile,
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Profil tidak ditemukan",
      });
    }

    return sendSuccess(res, result, "Profil berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateMyProfile");
  }
};
