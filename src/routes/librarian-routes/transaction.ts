import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsHandler,
  showTransaction,
  updateTransaction,
} from "@/controller/librarian/transaction/transaction.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "@/validations/transaction.schema";

const router = Router();

router.use(verifyAuth);

router.get("/:status", validate(paginationSchema), getTransactionsHandler);
router.get("/detail/:id", showTransaction);
router.post("/", validate(createTransactionSchema), createTransaction);
router.put("/:id", validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
