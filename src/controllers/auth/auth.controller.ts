import { Request, Response } from "express";
import { authenticateUser } from "@/services/auth/auth.service";
import { sendError, sendSuccess } from "@/utils/core/handler";
import logger from "@/utils/core/logger";
import svgCaptcha from "svg-captcha";

export const getCaptcha = (req: Request, res: Response) => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    color: true,
  });

  res.cookie("captcha_token", captcha.text, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
  });

  res.type("svg");
  res.status(200).send(captcha.data);
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password, captcha } = req.body;
    const captchaToken = req.cookies.captcha_token;

    if (!captchaToken || captcha.toLowerCase() !== captchaToken.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Captcha tidak valid atau kedaluwarsa",
      });
    }

    res.clearCookie("captcha_token");

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
