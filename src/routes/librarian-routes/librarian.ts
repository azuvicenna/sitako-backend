import { Router } from "express";
import { getLibrarianHandler } from "@/controller/librarian/user/librarian.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";

const router = Router();

router.use(verifyAuth)

router.get("/:statusActive", validate(paginationSchema), getLibrarianHandler);

export default router;
