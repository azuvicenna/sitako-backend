import { Router } from "express";
import { getCaptcha, login, logout } from "@/controllers/auth/auth.controller";
import { validate } from "@/middlewares/validate";
import { loginSchema } from "@/validations/auth/auth.schema";
import { verifyAuth } from "@/middlewares/auth";

const router = Router();

router.get("/captcha", getCaptcha);
router.post("/login", validate(loginSchema), login);
router.post("/logout", verifyAuth, logout);

export default router;
