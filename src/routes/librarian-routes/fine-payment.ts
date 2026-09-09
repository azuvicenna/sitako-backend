import { Router } from "express";
import {
  createFinePayment,
  deleteFinePayment,
  getFinePaymentsHandler,
  showFinePayment,
  updateFinePayment,
} from "@/controller/librarian/fine-payment/fine-payment.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";
import {
  createFinePaymentSchema,
  updateFinePaymentSchema,
} from "@/validations/fine-payment.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema), getFinePaymentsHandler);
router.get("/detail/:id", showFinePayment);
router.post("/", validate(createFinePaymentSchema), createFinePayment);
router.put("/:id", validate(updateFinePaymentSchema), updateFinePayment);
router.delete("/:id", deleteFinePayment);

export default router;
