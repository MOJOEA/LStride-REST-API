import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

import { uploadProfileImage } from "../middleware/upload_profile.middleware";
import { updateProfileController, getMeController } from "../controllers/user.controller";

const router = Router();

router.patch("/me",uploadProfileImage.single("profileImage"),updateProfileController);
router.get("/me", getMeController);

export default router;