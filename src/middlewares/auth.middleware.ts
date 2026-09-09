import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/auth/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const verifyAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Akses ditolak. Belum login." });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res
      .status(401)
      .json({ success: false, message: "Sesi tidak valid atau kedaluwarsa." });
  }

  req.user = decoded;

  next();
};
