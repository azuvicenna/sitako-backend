import { Router } from "express";
import { getUserHandler } from "../controller/user-controller";
import { validate } from "../middleware/validate";
import { registerSchema } from "../validations/user.schema";

const router = Router();

router.get("/", getUserHandler);
// router.post('/register', validate(registerSchema), authController.register);

export default router;
