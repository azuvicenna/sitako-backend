import { Router } from "express";
import { getMemberHandler } from "../controller/user/member.controller";
import { validate } from "../middleware/validate";
import { paginationSchema } from "../validations/pagination.schema";

const router = Router();

router.get("/:statusActive", validate(paginationSchema), getMemberHandler);

export default router;
