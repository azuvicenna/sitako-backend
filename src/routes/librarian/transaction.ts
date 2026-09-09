import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsHandler,
  showTransaction,
  updateTransaction,
} from "@/controllers/librarian/transaction.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "@/validations/librarian/transaction.schema";

const router = Router();

router.use(verifyAuth);

router.get("/:status", validate(paginationSchema), getTransactionsHandler);
router.get("/detail/:id", showTransaction);
router.post("/", validate(createTransactionSchema), createTransaction);
router.put("/:id", validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
