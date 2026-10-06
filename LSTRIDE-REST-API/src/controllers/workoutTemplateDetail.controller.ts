import { Request, Response } from "express";
import {
  getWorkoutTemplateDetails,
  createWorkoutTemplateDetail,
  updateWorkoutTemplateDetail,
  deleteWorkoutTemplateDetail,
  bulkUpdateWorkoutTemplateDetails,
} from "../services/workoutTemplateDetail.service";

// ==========================================
// 🛠️ HTTP Response Helper Functions
// ==========================================
const sendSuccess = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

const sendError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({ message });
};

const handleControllerError = (res: Response, error: any, defaultMessage: string) => {
  console.error(error);
  
  // ตรวจสอบข้อความ Error ยอดนิยม เพื่อส่ง 404 (Not Found)
  const errorMessage = error?.message || "";
  const isNotFound = 
    errorMessage.includes("not found") || 
    errorMessage.includes("Not Found");

  if (isNotFound) {
    return sendError(res, 404, errorMessage);
  }

  // หากเป็น Error อื่นๆ ให้ส่ง 500 (Internal Server Error)
  return sendError(res, 500, defaultMessage);
};

// ==========================================
// 🎮 Controllers
// ==========================================

export const getWorkoutTemplateDetailsController = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const start = Math.max(Number(req.query.start) || 0, 0);

    // @ts-ignore
    const result = await getWorkoutTemplateDetails(templateId, limit, start);
    return sendSuccess(res, result);
  } catch (error) {
    return handleControllerError(res, error, "Failed to get workout template details");
  }
};

export const createWorkoutTemplateDetailController = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { exerciseId, sets, reps, weight, duration, restSeconds } = req.body;

    if (!exerciseId) {
      return sendError(res, 400, "exerciseId is required");
    }

    const detail = await createWorkoutTemplateDetail(
      // @ts-ignore
      templateId,
      { exerciseId, sets, reps, weight, duration, restSeconds }
    );
    return sendSuccess(res, detail, 201); // ส่ง 201 Created
  } catch (error) {
    return handleControllerError(res, error, "Failed to create workout template detail");
  }
};

export const updateWorkoutTemplateDetailController = async (req: Request, res: Response) => {
  try {
    const { detailId } = req.params;

    // @ts-ignore
    const detail = await updateWorkoutTemplateDetail(detailId, req.body);
    return sendSuccess(res, detail);
  } catch (error) {
    return handleControllerError(res, error, "Failed to update workout template detail");
  }
};

export const deleteWorkoutTemplateDetailController = async (req: Request, res: Response) => {
  try {
    const { detailId } = req.params;

    // @ts-ignore
    const result = await deleteWorkoutTemplateDetail(detailId);
    return sendSuccess(res, result);
  } catch (error) {
    return handleControllerError(res, error, "Failed to delete workout template detail");
  }
};

export const bulkUpdateWorkoutTemplateDetailsController = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    // @ts-ignore
    const result = await bulkUpdateWorkoutTemplateDetails(templateId, req.body);
    return sendSuccess(res, {
      message: "Workout template details updated successfully",
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error, "Failed to update workout template details");
  }
};
