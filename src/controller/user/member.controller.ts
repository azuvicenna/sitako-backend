import { Request, Response } from "express";
import * as memberRepository from "../../repositories/user/member.repository";
import logger from "../../utils/logger";
import {
  getPaginationParams,
  sendError,
  sendSuccess,
} from "../../utils/handler";

export const getMemberHandler = async (req: Request, res: Response) => {
  try {
    const statusActive = req.params.statusActive as string;

    if (!statusActive || !["Semua", "true", "false"].includes(statusActive)) {
      logger.warn(`Status aktif tidak valid - ${statusActive}`);

      return res.status(400).json({
        success: false,
        message: "Status aktif tidak valid",
      });
    }

    const { page, limit, search } = getPaginationParams(req.query);

    const result = await memberRepository.findMembersWithPagination(
      statusActive,
      page,
      limit,
      search,
    );

    logger.info(
      `Memproses request data anggota: status_aktif=${statusActive}, search=${search}, page=${page}`,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error, "getMemberHandler");
  }
};
