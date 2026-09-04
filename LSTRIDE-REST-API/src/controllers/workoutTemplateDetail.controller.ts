import { Request, Response } from "express";

import {
  getWorkoutTemplateDetails,
  createWorkoutTemplateDetail,
  updateWorkoutTemplateDetail,
  deleteWorkoutTemplateDetail,
  bulkUpdateWorkoutTemplateDetails,
} from "../services/workoutTemplateDetail.service";

export const getWorkoutTemplateDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { templateId } = req.params;

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100
    );

    const start = Math.max(
      Number(req.query.start) || 0,
      0
    );

    const result = await getWorkoutTemplateDetails(
    // @ts-ignore
      templateId,
      limit,
      start
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get workout template details",
    });
  }
};

export const createWorkoutTemplateDetailController = async (
  req: Request,
  res: Response
) => {
  try {
    const { templateId } = req.params;

    const {
      exerciseId,
      sets,
      reps,
      weight,
      duration,
      restSeconds,
    } = req.body;

    if (!exerciseId) {
      return res.status(400).json({
        message: "exerciseId is required",
      });
    }

    const detail = await createWorkoutTemplateDetail(
    // @ts-ignore
      templateId,
      {
        exerciseId,
        sets,
        reps,
        weight,
        duration,
        restSeconds,
      }
    );

    return res.status(201).json(detail);
  } catch (error: any) {
    console.error(error);

    if (
      error.message === "Workout template not found" ||
      error.message === "Exercise not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create workout template detail",
    });
  }
};

export const updateWorkoutTemplateDetailController = async (
  req: Request,
  res: Response
) => {
  try {
    const { detailId } = req.params;

    const detail = await updateWorkoutTemplateDetail(
    // @ts-ignore
      detailId,
      req.body
    );

    return res.status(200).json(detail);
  } catch (error: any) {
    console.error(error);

    if (
      error.message ===
        "Workout template detail not found" ||
      error.message === "Exercise not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update workout template detail",
    });
  }
};

export const deleteWorkoutTemplateDetailController = async (
  req: Request,
  res: Response
) => {
  try {
    const { detailId } = req.params;

    const result = await deleteWorkoutTemplateDetail(
    // @ts-ignore
      detailId
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (
      error.message ===
      "Workout template detail not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete workout template detail",
    });
  }
};

export const bulkUpdateWorkoutTemplateDetailsController =
  async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;

      const result =
        await bulkUpdateWorkoutTemplateDetails(
        // @ts-ignore
          templateId,
          req.body
        );

      return res.status(200).json({
        message:
          "Workout template details updated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      if (
        error.message === "Workout template not found" ||
        error.message.includes(
          "Workout template detail not found"
        ) ||
        error.message.includes("Exercise not found")
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Failed to update workout template details",
      });
    }
  };