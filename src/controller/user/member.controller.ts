import { Request, Response } from "express";
import * as memberRepository from "../../repositories/user/member.repository";
import logger from "../../utils/logger";

export const getMemberHandler = async (req: Request, res: Response) => {
  try {
    const statusActive = req.params.statusActive as string;

    if (!statusActive) {
      logger.warn("Pencarian gagal: Parameter status aktif kosong");

      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    if (!["Semua", "true", "false"].includes(statusActive)) {
      logger.warn(
        `Pencarian gagal: Status aktif tidak valid - ${statusActive}`,
      );

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

    logger.info(
      `Memproses request data anggota: status_aktif=${statusActive}, search=${search}, page=${page}`,
    );

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error(
      `Error pada getMemberHandler: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
