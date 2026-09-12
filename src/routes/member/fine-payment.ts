import { Router } from "express";
import {
  getFinePaymentsHandler,
  showFinePayment,
  initiatePayment,
} from "@/controllers/member/fine-payment.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";
import { initiateOnlinePaymentSchema } from "@/validations/member/fine-payment.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema, "query"), getFinePaymentsHandler);
router.get("/detail/:id", showFinePayment);
router.post("/pay", validate(initiateOnlinePaymentSchema), initiatePayment);

export default router;
