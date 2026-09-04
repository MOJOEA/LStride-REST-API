import { Router } from "express";

import {
  createWorkoutTemplateController,
  updateWorkoutTemplateController,
  deleteWorkoutTemplateController,
  getPublicWorkoutTemplatesController,
  getMyWorkoutTemplatesController,
  getFollowingWorkoutTemplatesController,
  getWorkoutTemplateByIdController,
} from "../controllers/workoutTemplate.controller";
const router = Router();

// CREATE
router.post(
  "/",
  createWorkoutTemplateController
);

// GET MY
// /me ต้องอยู่ก่อน /:id
router.get(
  "/me",
  getMyWorkoutTemplatesController
);

// GET FOLLOWING
// /following ต้องอยู่ก่อน /:id
router.get(
  "/following",
  getFollowingWorkoutTemplatesController
);

// GET PUBLIC + FOLLOWERS_ONLY
router.get(
  "/",
  getPublicWorkoutTemplatesController
);

// UPDATE
router.put(
  "/:id",
  updateWorkoutTemplateController
);

// DELETE
router.delete(
  "/:id",
  deleteWorkoutTemplateController
);

// GET BY ID
// ต้องเป็นตัวสุดท้าย
router.get(
  "/:id",
  getWorkoutTemplateByIdController
);

export default router;