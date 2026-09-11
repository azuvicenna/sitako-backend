import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type Source = "body" | "query" | "params";

export const validate = (schema: z.ZodType, source: Source = "body") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
