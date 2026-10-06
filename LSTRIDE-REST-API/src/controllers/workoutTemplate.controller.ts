import { Request, Response } from "express";
import {
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  getPublicWorkoutTemplates,
  getMyWorkoutTemplates,
  getFollowingWorkoutTemplates,
  getWorkoutTemplateById,
} from "../services/workoutTemplate.service";
import { Visibility } from "@prisma/client";

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
  const errorMessage = error?.message || "";

  // ดักจับ Error เฉพาะเจาะจงจาก Service
  if (errorMessage === "TEMPLATE_NOT_FOUND") {
    return sendError(res, 404, "Workout template not found");
  }
  
  if (errorMessage === "FORBIDDEN") {
    return sendError(res, 403, defaultMessage.includes("get") 
      ? "You do not have permission to view this template" 
      : "You are not the creator of this template"
    );
  }

  // หากเป็น Error อื่นๆ ส่ง 500
  return sendError(res, 500, defaultMessage);
};

// ==========================================
// 🎮 Controllers
// ==========================================

// ===============================
// CREATE
// ===============================
export const createWorkoutTemplateController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, description, visibility } = req.body;

    if (!name) {
      return sendError(res, 400, "name is required");
    }

    if (visibility && !Object.values(Visibility).includes(visibility)) {
      return sendError(res, 400, "Invalid visibility");
    }

    const template = await createWorkoutTemplate(userId, { name, description, visibility });
    return sendSuccess(res, template, 201);
  } catch (error) {
    return handleControllerError(res, error, "Failed to create workout template");
  }
};

// ===============================
// UPDATE
// ===============================
export const updateWorkoutTemplateController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, visibility } = req.body;

    if (visibility && !Object.values(Visibility).includes(visibility)) {
      return sendError(res, 400, "Invalid visibility");
    }

    // @ts-ignore
    const template = await updateWorkoutTemplate(id, userId, { name, description, visibility });
    return sendSuccess(res, template);
  } catch (error) {
    return handleControllerError(res, error, "Failed to update workout template");
  }
};

// ===============================
// DELETE
// ===============================
export const deleteWorkoutTemplateController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // @ts-ignore
    const result = await deleteWorkoutTemplate(id, userId);
    return sendSuccess(res, result);
  } catch (error) {
    return handleControllerError(res, error, "Failed to delete workout template");
  }
};

// ===============================
// GET PUBLIC + FOLLOWERS_ONLY
// ===============================
export const getPublicWorkoutTemplatesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const templates = await getPublicWorkoutTemplates(userId, limit);
    return sendSuccess(res, { limit, count: templates.length, data: templates });
  } catch (error) {
    return handleControllerError(res, error, "Failed to get workout templates");
  }
};

// ===============================
// GET MY TEMPLATES
// ===============================
export const getMyWorkoutTemplatesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const templates = await getMyWorkoutTemplates(userId, limit);
    return sendSuccess(res, { limit, count: templates.length, data: templates });
  } catch (error) {
    return handleControllerError(res, error, "Failed to get your workout templates");
  }
};

// ===============================
// GET FOLLOWING TEMPLATES
// ===============================
export const getFollowingWorkoutTemplatesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const templates = await getFollowingWorkoutTemplates(userId, limit);
    return sendSuccess(res, { limit, count: templates.length, data: templates });
  } catch (error) {
    return handleControllerError(res, error, "Failed to get following workout templates");
  }
};

// ===============================
// GET BY ID
// ===============================
export const getWorkoutTemplateByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // @ts-ignore
    const template = await getWorkoutTemplateById(id, userId);
    return sendSuccess(res, template);
  } catch (error) {
    return handleControllerError(res, error, "Failed to get workout template");
  }
};
