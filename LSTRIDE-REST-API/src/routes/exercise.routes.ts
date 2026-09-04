import { Router } from "express";
import {
  getExercisesController,
  getExerciseByIdController,
} from "../controllers/exercise.controller";

const router = Router();

router.get(
  "/", 
  getExercisesController
);

router.get(
  "/:id",
  getExerciseByIdController
);

export default router;