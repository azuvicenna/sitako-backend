import { Router } from "express";
import { getUserHandler } from "../controller/user-controller";

const router = Router();

router.get("/", getUserHandler);

export default router;
