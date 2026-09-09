import { Router } from "express";
import { getCaptcha, login } from "@/controllers/auth/auth.controller";
import { validate } from "@/middlewares/validate";
import { loginSchema } from "@/validations/auth/auth.schema";

const router = Router();

router.get("/captcha", getCaptcha);
router.post("/login", validate(loginSchema), login);

export default router;
