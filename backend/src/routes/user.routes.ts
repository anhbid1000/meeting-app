import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.put("/profile", auth, userController.updateProfile);

export default router;
