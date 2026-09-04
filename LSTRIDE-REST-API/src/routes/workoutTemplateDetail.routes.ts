import { Router } from "express";

import {
  getWorkoutTemplateDetailsController,
  createWorkoutTemplateDetailController,
  updateWorkoutTemplateDetailController,
  deleteWorkoutTemplateDetailController,
  bulkUpdateWorkoutTemplateDetailsController,
} from "../controllers/workoutTemplateDetail.controller";

const router = Router();


router.get(
  "/:templateId",
  getWorkoutTemplateDetailsController
);

router.post(
  "/:templateId",
  createWorkoutTemplateDetailController
);

router.patch(
  "/:templateId/bulk",
  bulkUpdateWorkoutTemplateDetailsController
);

router.patch(
  "/:detailId",
  updateWorkoutTemplateDetailController
);

router.delete(
  "/:detailId",
  deleteWorkoutTemplateDetailController
);

export default router;