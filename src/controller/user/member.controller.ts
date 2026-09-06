import { Request, Response } from "express";
import * as memberRepository from "../../repositories/user/member.repository";

export const getMemberHandler = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

    const result = await memberRepository.findMembersWithPagination(
      page,
      limit,
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
