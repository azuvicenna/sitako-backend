import { Router } from "express";
import {
  createMyTransaction,
  getMyTransactions,
  showMyTransaction,
} from "@/controllers/member/transaction.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";
import { createTransactionSchema } from "@/validations/member/transaction.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema, "query"), getMyTransactions);
router.get("/detail/:id", showMyTransaction);
router.post("/", validate(createTransactionSchema), createMyTransaction);

export default router;
