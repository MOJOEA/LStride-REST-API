import { Router } from "express";

import {
  createClubController,
  updateClubController,
  deleteClubController,
  getClubsController,
  getClubByIdController,
} from "../controllers/club.controller";

const router = Router();

// 1. สร้าง Club
router.post(
  "/",
  createClubController
);

// 4. ดึงรายการ Club
router.get(
  "/",
  getClubsController
);

// 5. ดึง Club ด้วย ID
router.get(
  "/:clubId",
  getClubByIdController
);

// 2. แก้ไข Club
router.patch(
  "/:clubId",
  updateClubController
);

// 3. ลบ Club
router.delete(
  "/:clubId",
  deleteClubController
);

export { router as clubRoutes };