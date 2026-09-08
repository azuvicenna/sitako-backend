import { Router } from "express";
import { getFinePaymentHandler } from "@/controller/librarian/fine-payment/fine-payment.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";

const router = Router();

router.use(verifyAuth)

router.get("/", validate(paginationSchema), getFinePaymentHandler);

export default router;
