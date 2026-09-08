import { Router } from "express";
import { getTransactionHandler } from "@/controller/librarian/transaction/transaction.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";

const router = Router();

router.use(verifyAuth)

router.get("/:status", validate(paginationSchema), getTransactionHandler);

export default router;
