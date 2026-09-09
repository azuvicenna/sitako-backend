import { Router } from "express";
import {
  getLibrarianHandler,
  showLibrarian,
  createLibrarian,
  updateLibrarian,
  deleteLibrarian,
} from "@/controllers/librarian/librarian.controller";
import { validate } from "@/middlewares/validate";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import {
  createLibrarianSchema,
  updateLibrarianSchema,
} from "@/validations/librarian/librarian.schema";
import { verifyAuth } from "@/middlewares/auth";
import { upload } from "@/middlewares/upload";

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
