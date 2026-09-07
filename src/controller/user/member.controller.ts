import { Request, Response } from "express";
import * as memberRepository from "../../repositories/user/member.repository";

export const getMemberHandler = async (req: Request, res: Response) => {
  try {
    const statusActive = req.params.statusActive as string;

    if (!statusActive) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    if (!["Semua", "true", "false"].includes(statusActive)) {
      return res.status(400).json({
        success: false,
        message: "Status aktif tidak valid",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const result = await memberRepository.findMembersWithPagination(
      statusActive,
      page,
      limit,
      search,
    );

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
