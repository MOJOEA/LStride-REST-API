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

// ===============================
// CREATE
// ===============================

export const createWorkoutTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const {
      name,
      description,
      visibility,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "name is required",
      });
    }

    if (
      visibility &&
      !Object.values(Visibility).includes(visibility)
    ) {
      return res.status(400).json({
        message: "Invalid visibility",
      });
    }

    const template = await createWorkoutTemplate(
      userId,
      {
        name,
        description,
        visibility,
      }
    );

    return res.status(201).json(template);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create workout template",
    });
  }
};

// ===============================
// UPDATE
// ===============================

export const updateWorkoutTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const {
      name,
      description,
      visibility,
    } = req.body;

    if (
      visibility &&
      !Object.values(Visibility).includes(visibility)
    ) {
      return res.status(400).json({
        message: "Invalid visibility",
      });
    }

    const template = await updateWorkoutTemplate(
      // @ts-ignore
      id,
      userId,
      {
        name,
        description,
        visibility,
      }
    );

    return res.json(template);
  } catch (error: any) {
    console.error(error);

    if (error.message === "TEMPLATE_NOT_FOUND") {
      return res.status(404).json({
        message: "Workout template not found",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message:
          "You are not the creator of this template",
      });
    }

    return res.status(500).json({
      message: "Failed to update workout template",
    });
  }
};

// ===============================
// DELETE
// ===============================

export const deleteWorkoutTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await deleteWorkoutTemplate(
      // @ts-ignore
      id,
      userId
    );

    return res.json(result);
  } catch (error: any) {
    console.error(error);

    if (error.message === "TEMPLATE_NOT_FOUND") {
      return res.status(404).json({
        message: "Workout template not found",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message:
          "You are not the creator of this template",
      });
    }

    return res.status(500).json({
      message: "Failed to delete workout template",
    });
  }
};

// ===============================
// GET PUBLIC + FOLLOWERS_ONLY
// ===============================

export const getPublicWorkoutTemplatesController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user!.id;

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 20,
          1
        ),
        100
      );

      const templates =
        await getPublicWorkoutTemplates(
          userId,
          limit
        );

      return res.json({
        limit,
        count: templates.length,
        data: templates,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to get workout templates",
      });
    }
  };

// ===============================
// GET MY TEMPLATES
// ===============================

export const getMyWorkoutTemplatesController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user!.id;

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 20,
          1
        ),
        100
      );

      const templates =
        await getMyWorkoutTemplates(
          userId,
          limit
        );

      return res.json({
        limit,
        count: templates.length,
        data: templates,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to get your workout templates",
      });
    }
  };

// ===============================
// GET FOLLOWING TEMPLATES
// ===============================

export const getFollowingWorkoutTemplatesController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user!.id;

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 20,
          1
        ),
        100
      );

      const templates =
        await getFollowingWorkoutTemplates(
          userId,
          limit
        );

      return res.json({
        limit,
        count: templates.length,
        data: templates,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to get following workout templates",
      });
    }
  };

// ===============================
// GET BY ID
// ===============================

export const getWorkoutTemplateByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const template =
        await getWorkoutTemplateById(
          // @ts-ignore
          id,
          userId
        );

      return res.json(template);
    } catch (error: any) {
      console.error(error);

      if (
        error.message ===
        "TEMPLATE_NOT_FOUND"
      ) {
        return res.status(404).json({
          message:
            "Workout template not found",
        });
      }

      if (
        error.message === "FORBIDDEN"
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to view this template",
        });
      }

      return res.status(500).json({
        message:
          "Failed to get workout template",
      });
    }
  };