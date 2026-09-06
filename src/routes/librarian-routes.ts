import { Router } from "express";
import { getLibrarianHandler } from "../controller/user/librarian.controller";
import { validate } from "../middleware/validate";
import { paginationSchema } from "../validations/pagination.schema";

const router = Router();

router.get("/:statusActive", validate(paginationSchema), getLibrarianHandler);

export default router;
