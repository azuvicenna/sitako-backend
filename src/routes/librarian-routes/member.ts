import { Router } from "express";
import { getMemberHandler } from "@/controller/librarian/user/member.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";

const router = Router();

router.use(verifyAuth)

router.get("/:statusActive", validate(paginationSchema), getMemberHandler);

export default router;
