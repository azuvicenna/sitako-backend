import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "@/controllers/profile/profile.controller";
import { verifyAuth } from "@/middlewares/auth.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

export default router;
