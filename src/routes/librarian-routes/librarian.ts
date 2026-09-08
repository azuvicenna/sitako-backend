import { Router } from "express";
import {
  getLibrarianHandler,
  showLibrarian,
  createLibrarian,
  updateLibrarian,
  deleteLibrarian,
} from "@/controller/librarian/user/librarian.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import {
  createLibrarianSchema,
  updateLibrarianSchema,
} from "@/validations/librarian.schema";
import { verifyAuth } from "@/middleware/auth";
import { upload } from "@/middleware/upload";

const router = Router();

router.use(verifyAuth);

router.get(
  "/status/:statusActive",
  validate(paginationSchema),
  getLibrarianHandler,
);
router.get("/:id", showLibrarian);
router.post(
  "/",
  upload.single("foto"),
  validate(createLibrarianSchema),
  createLibrarian,
);
router.put(
  "/:id",
  upload.single("foto"),
  validate(updateLibrarianSchema),
  updateLibrarian,
);
router.delete("/:id", deleteLibrarian);

export default router;
