import { Router } from "express";
import { getFinePaymentHandler } from "../controller/fine-payment/fine-payment.controller";
import { validate } from "../middleware/validate";
import { paginationSchema } from "../validations/pagination.schema";

const router = Router();

router.get("/", validate(paginationSchema), getFinePaymentHandler);

export default router;
