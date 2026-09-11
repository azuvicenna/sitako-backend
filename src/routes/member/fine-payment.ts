import { Router } from "express";
import {
  getFinePaymentsHandler,
  showFinePayment,
} from "@/controllers/member/fine-payment.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema, "query"), getFinePaymentsHandler);
router.get("/detail/:id", showFinePayment);

export default router;
