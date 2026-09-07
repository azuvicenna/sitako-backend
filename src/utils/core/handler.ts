import { Response } from "express";
import logger from "./logger";

export const getPaginationParams = (query: any) => ({
  page: Math.max(1, parseInt(query.page as string) || 1),
  limit: Math.max(1, parseInt(query.limit as string) || 10),
  search: (query.search as string) || "",
});

export const sendSuccess = (
  res: Response,
  data: any,
  message = "Data retrieved successfully",
) => {
  return res.status(200).json({
    success: true,
    message,
    ...data,
  });
};

export const sendError = (res: Response, error: unknown, context: string) => {
  logger.error(
    `Error pada ${context}: ${error instanceof Error ? error.message : "Unknown Error"}`,
    { error },
  );
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
