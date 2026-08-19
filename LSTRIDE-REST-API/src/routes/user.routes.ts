import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload.middleware";
import { updateProfileController } from "../controllers/user/user.controller";

const router = Router();

router.patch("/me",uploadProfileImage.single("profileImage"),updateProfileController);

export default router;