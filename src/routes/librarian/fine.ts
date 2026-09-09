import { Router } from "express";
import {
  createFine,
  deleteFine,
  getFinesHandler,
  showFine,
  updateFine,
} from "@/controllers/librarian/fine.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";
import {
  createFineSchema,
  updateFineSchema,
} from "@/validations/librarian/fine.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema), getFinesHandler);
router.get("/detail/:id", showFine);
router.post("/", validate(createFineSchema), createFine);
router.put("/:id", validate(updateFineSchema), updateFine);
router.delete("/:id", deleteFine);

export default router;
