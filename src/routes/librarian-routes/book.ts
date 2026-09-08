import { Router } from "express";
import {
  getBookHandler,
  showBook,
  createBook,
  updateBook,
  deleteBook,
} from "@/controller/librarian/book/book.controller";
import { validate } from "@/middleware/validate";
import { upload } from "@/middleware/upload";
import { createBookSchema, updateBookSchema } from "@/validations/book.schema";

const router = Router();

const bookUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

router.get("/:bookType", getBookHandler);
router.get("/detail/:id", showBook);
router.post("/:bookType", bookUpload, validate(createBookSchema), createBook);
router.put("/:id", bookUpload, validate(updateBookSchema), updateBook);
router.delete("/:id", deleteBook);

export default router;
