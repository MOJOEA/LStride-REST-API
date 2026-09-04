import { Request, Response } from "express";
import {
  getExercises,
  getExerciseById,
} from "../services/exercise.service";

export const getExercisesController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      equipment,
      level,
      category,
      muscle,
      limit,
    } = req.query;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const exercises = await getExercises({
      name: name as string | undefined,
      equipment: equipment as string | undefined,
      level: level as string | undefined,
      category: category as string | undefined,
      muscle: muscle as string | undefined,
      limit: limit ? Number(limit) : 20,
    });

    return res.status(200).json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get exercises",
    });
  }
};

export const getExerciseByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // @ts-ignore
    const exercise = await getExerciseById(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get exercise",
    });
  }
};