import { Router } from "express";
import { getShelfHandler } from "@/controller/librarian/shelf/shelf.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";

const router = Router();

router.use(verifyAuth)

router.get("/", validate(paginationSchema), getShelfHandler);
router.get("/:id/stacks", validate(paginationSchema), getShelfHandler);

export default router;
