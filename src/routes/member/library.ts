import { Router } from "express";
import {
  showBook,
  readDigitalBook,
  createBookmark,
  deleteBookmark,
} from "@/controllers/member/library.controller";
import { verifyAuth } from "@/middlewares/auth.middleware";
import { createBookmarkSchema } from "@/validations/member/bookmark.schema";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/detail/:id", showBook);
router.get("/digital/read/:id", readDigitalBook);
router.post("/bookmark/:id", validate(createBookmarkSchema), createBookmark);
router.delete("/bookmark/delete/:bookmarkId", deleteBookmark);

export default router;
