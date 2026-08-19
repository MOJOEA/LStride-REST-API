import { Request, Response } from "express";
import { updateProfile } from "../../services/user.service";

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
        Description: req.body.Description,
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