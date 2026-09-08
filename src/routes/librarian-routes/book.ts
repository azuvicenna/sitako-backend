import { Router } from "express";
import { getBookHandler } from "@/controller/librarian/book/book.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";

const router = Router();

router.use(verifyAuth)

router.get("/:bookType", validate(paginationSchema), getBookHandler);

export default router;
