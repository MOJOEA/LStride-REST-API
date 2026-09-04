import { Request, Response } from "express";
import {
  createClub,
  updateClub,
  deleteClub,
  getClubs,
  getClubById,
} from "../services/club.service";

export const createClubController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const {
      name,
      description,
      joinPolicy,
      profileImage,
      bannerImage,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "name is required",
      });
    }

    const club = await createClub(userId, {
      name,
      description,
      joinPolicy,
      profileImage,
      bannerImage,
    });

    return res.status(201).json(club);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateClubController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { clubId } = req.params;

    const club = await updateClub(
        // @ts-ignore
      clubId,
      userId,
      req.body
    );

    return res.status(200).json(club);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Club not found"
    ) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return res.status(403).json({
        message: "Only club owner can update this club",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteClubController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { clubId } = req.params;

    // @ts-ignore
    await deleteClub(clubId, userId);

    return res.status(200).json({
      message: "Club deleted successfully",
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Club not found"
    ) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return res.status(403).json({
        message: "Only club owner can delete this club",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getClubsController = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const start = Math.max(
      Number(req.query.start) || 0,
      0
    );

    const name =
      typeof req.query.name === "string"
        ? req.query.name
        : undefined;

    const clubs = await getClubs(
      limit,
      start,
      name
    );

    return res.status(200).json({
      limit,
      start,
      name: name ?? null,
      data: clubs,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getClubByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { clubId } = req.params;

    const club = await getClubById(
        // @ts-ignore
      clubId,
      userId
    );

    return res.status(200).json(club);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Club not found"
    ) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};