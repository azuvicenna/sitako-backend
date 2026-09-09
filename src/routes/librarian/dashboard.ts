import { Router } from "express";
import {
  getSummary,
  getTodayTransactions,
  getWeeklyStatistics,
} from "@/controllers/librarian/dashboard.controller";
import { verifyAuth } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { paginationSchema } from "@/validations/utils/pagination.schema";

const router = Router();

router.use(verifyAuth);

router.get("/summary", getSummary);
router.get(
  "/transaction/today",
  validate(paginationSchema),
  getTodayTransactions,
);
router.get("/statistics", getWeeklyStatistics);

export default router;
