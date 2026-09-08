import { Router } from "express";
import {
  getMemberHandler,
  showMember,
  createMember,
  updateMember,
  deleteMember,
} from "@/controller/librarian/user/member.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import {
  createMemberSchema,
  updateMemberSchema,
} from "@/validations/member.schema";
import { verifyAuth } from "@/middleware/auth";
import { upload } from "@/middleware/upload";

const router = Router();

router.use(verifyAuth);

router.get(
  "/status/:statusActive",
  validate(paginationSchema),
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
