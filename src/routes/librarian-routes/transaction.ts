import { Router } from "express";
import { getTransactionHandler } from "../../controller/transaction/transaction.controller";
import { validate } from "../../middleware/validate";
import { paginationSchema } from "../../validations/pagination.schema";

const router = Router();

router.get("/:status", validate(paginationSchema), getTransactionHandler);

export default router;
