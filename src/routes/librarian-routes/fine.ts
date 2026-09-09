import { Router } from "express";
import {
  createFine,
  deleteFine,
  getFinesHandler,
  showFine,
  updateFine,
} from "@/controller/librarian/fine/fine.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";
import { createFineSchema, updateFineSchema } from "@/validations/fine.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema), getFinesHandler);
router.get("/detail/:id", showFine);
router.post("/", validate(createFineSchema), createFine);
router.put("/:id", validate(updateFineSchema), updateFine);
router.delete("/:id", deleteFine);

export default router;
