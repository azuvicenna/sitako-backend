import { Router } from "express";
import {
  createFinePayment,
  deleteFinePayment,
  getFinePaymentsHandler,
  showFinePayment,
  updateFinePayment,
} from "@/controllers/librarian/fine-payment.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";
import {
  createFinePaymentSchema,
  updateFinePaymentSchema,
} from "@/validations/librarian/fine-payment.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema), getFinePaymentsHandler);
router.get("/detail/:id", showFinePayment);
router.post("/", validate(createFinePaymentSchema), createFinePayment);
router.put("/:id", validate(updateFinePaymentSchema), updateFinePayment);
router.delete("/:id", deleteFinePayment);

export default router;
