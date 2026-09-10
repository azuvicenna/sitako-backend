import { sendError, sendSuccess } from "@/utils/core/handler";
import { Response } from "express";
import * as librarianService from "@/services/librarian/librarian.service";
import * as memberService from "@/services/librarian/member.service";
import {
  imageFileSchema,
  updateLibrarianSchema,
} from "@/validations/librarian/librarian.schema";
import { updateMemberSchema } from "@/validations/librarian/member.schema";
import { AuthRequest } from "@/middlewares/auth.middleware";

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    let result;

    if (userRole === "Pustakawan") {
      result = await librarianService.getLibrarianById(userId);
    } else {
      result = await memberService.getMemberById(userId);
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
    } else {
      const validatedBody = updateMemberSchema.parse(req.body);
      result = await memberService.updateExistingMember(
        userId,
        validatedBody,
        validatedFile,
      );
    }

    return sendSuccess(res, result, "Profil berhasil diperbarui");
  } catch (error) {
    return sendError(res, error, "updateMyProfile");
  }
};
