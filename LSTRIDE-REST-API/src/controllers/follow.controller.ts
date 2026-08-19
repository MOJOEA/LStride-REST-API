import { Request, Response } from "express";
import { followUser, unfollowUser } from "../services/follow.service";

export const followUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const followerId = req.user!.id;
    const followingId = req.params.userid;

    const result = await followUser(
      // @ts-ignore
      followerId, followingId);

    return res.status(201).json({
      message: "Followed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "CANNOT_FOLLOW_SELF":
          return res.status(400).json({
            message: "You cannot follow yourself",
          });

        case "USER_NOT_FOUND":
          return res.status(404).json({
            message: "User not found",
          });

        case "ALREADY_FOLLOWING":
          return res.status(409).json({
            message: "Already following this user",
          });
      }
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const unfollowUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const followerId = req.user!.id;
    const { userid: followingId } = req.params;
    // @ts-ignore
    await unfollowUser(followerId, followingId);

    return res.status(200).json({
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "NOT_FOLLOWING") {
        return res.status(400).json({
          message: "You are not following this user",
        });
      }
    }

    return res.status(500).json({
      message: "Failed to unfollow user",
    });
  }
};
