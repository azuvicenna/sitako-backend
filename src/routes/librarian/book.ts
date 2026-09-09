import { Router } from "express";
import {
  getBookHandler,
  showBook,
  createBook,
  updateBook,
  deleteBook,
} from "@/controllers/librarian/book.controller";
import { validate } from "@/middlewares/validate";
import { upload } from "@/middlewares/upload";
import {
  createBookSchema,
  updateBookSchema,
} from "@/validations/librarian/book.schema";
import { paginationSchema } from "@/validations/utils/pagination.schema";
import { verifyAuth } from "@/middlewares/auth";

const router = Router();

router.use(verifyAuth);

const bookUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

router.get("/:bookType", validate(paginationSchema), getBookHandler);
router.get("/detail/:id", showBook);
router.post("/:bookType", bookUpload, validate(createBookSchema), createBook);
router.put("/:id", bookUpload, validate(updateBookSchema), updateBook);
router.delete("/:id", deleteBook);

export default router;
