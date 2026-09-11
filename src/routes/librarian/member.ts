import { Router } from "express";
import {
  getMemberHandler,
  showMember,
  createMember,
  updateMember,
  deleteMember,
} from "@/controllers/librarian/member.controller";
import { validate } from "@/middlewares/validate.middleware";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import {
  createMemberSchema,
  updateMemberSchema,
} from "@/validations/librarian/member.schema";
import { verifyAuth } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";

const router = Router();

router.use(verifyAuth);

router.get(
  "/",
  validate(paginationSchema, "query"),
  getMemberHandler,
);
router.get("/:id", showMember);
router.post(
  "/",
  upload.single("foto"),
  validate(createMemberSchema),
  createMember,
);
router.put(
  "/:id",
  upload.single("foto"),
  validate(updateMemberSchema),
  updateMember,
);
router.delete("/:id", deleteMember);

export default router;
