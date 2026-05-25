import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.put("/profile", auth, userController.updateProfile);
router.get("/search", auth, userController.findUsersByKeyword);
router.post("/subscription/pro-trial", auth, userController.upgradeToPro);
router.post("/subscription/check-expiry", auth, userController.checkAndDowngradePlan);

export default router;
