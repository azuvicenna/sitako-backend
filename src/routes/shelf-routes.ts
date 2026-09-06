import { Router } from "express";
import { getShelfHandler } from "../controller/shelf/shelf.controller";
import { validate } from "../middleware/validate";
import { paginationSchema } from "../validations/pagination.schema";

const router = Router();

router.get("/", validate(paginationSchema), getShelfHandler);
router.get("/:id/stacks", validate(paginationSchema), getShelfHandler);

export default router;
