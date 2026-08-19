import { Request, Response } from "express";
import { updateProfile, getMe } from "../services/user.service";

export const getMeController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await getMe(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const profileImage = req.file
      ? `/uploads/profile/${req.file.filename}`
      : undefined;

    const user = await updateProfile(
      userId,
      {
        name: req.body.name,
        gender: req.body.gender,
        bio: req.body.bio,
      },
      profileImage
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};