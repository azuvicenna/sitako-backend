import { Router } from "express";
import { login } from "@/controller/auth/auth.controller";
import { validate } from "@/middleware/validate";
import { loginSchema } from "@/validations/auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), login);

export default router;
