import { Router } from "express";
import {
  createShelf,
  deleteShelf,
  getShelvesHandler,
  showShelf,
  updateShelf,
} from "@/controller/librarian/shelf/shelf.controller";
import { validate } from "@/middleware/validate";
import { paginationSchema } from "@/validations/pagination.schema";
import { verifyAuth } from "@/middleware/auth";
import {
  createShelfSchema,
  updateShelfSchema,
} from "@/validations/shelf.schema";
import {
  createStack,
  deleteStack,
  getStacksHandler,
  showStack,
  updateStack,
} from "@/controller/librarian/shelf/stack.controller";
import {
  createStackSchema,
  updateStackSchema,
} from "@/validations/stack.schema";

const router = Router();

router.use(verifyAuth);

router.get("/", validate(paginationSchema), getShelvesHandler);
router.get("/detail/:id", showShelf);
router.post("/", validate(createShelfSchema), createShelf);
router.put("/:id", validate(updateShelfSchema), updateShelf);
router.delete("/:id", deleteShelf);

router.get("/:shelfId/stacks", validate(paginationSchema), getStacksHandler);
router.get("/:shelfId/stacks/detail/:id", showStack);
router.post("/:shelfId/stacks/", validate(createStackSchema), createStack);
router.put("/:shelfId/stacks/:id", validate(updateStackSchema), updateStack);
router.delete("/:shelfId/stacks/:id", deleteStack);

export default router;
