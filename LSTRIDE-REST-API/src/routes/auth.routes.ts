import { Router } from "express";

import {
  registerController,
  loginController,
  googleLoginController,
} from "../controllers/auth/auth.controller";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/google", googleLoginController);

export default router;