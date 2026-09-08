import { Request, Response } from "express";
import { authenticateUser } from "@/services/auth/auth.services";
import { sendError, sendSuccess } from "@/utils/core/handler";
import logger from "@/utils/core/logger";

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    logger.info(`Memproses request login untuk NIP/NIS: ${identifier}`);

    const result = await authenticateUser(identifier, password);

    if (!result) {
      logger.warn(`Kredensial tidak valid untuk NIP/NIS: ${identifier}`);

      return res
        .status(401)
        .json({ success: false, message: "Kredensial tidak valid" });
    }

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { user: result.user }, "Login sukses");
  } catch (error) {
    return sendError(res, error, "login");
  }
};
