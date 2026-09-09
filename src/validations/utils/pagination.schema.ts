import { z } from "zod";

export const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 10)),
  }),
});
