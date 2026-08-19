import { Request, Response } from "express";
import {
  likePost,
  unlikePost,
} from "../services/like.service";

export const likePostController = async (
  req: Request,
  res: Response
) => {
  try {
    // ป้องกันระบบพังหากไม่ได้ใส่หรือแนบ auth middleware เข้ามาใน routes
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    const { postId } = req.params;

    // @ts-ignore
    await likePost(userId, postId);

    return res.status(201).json({
      message: "Post liked successfully",
    });
  } catch (error) {
    // 🛠️ บังคับพ่นเอเรอร์ที่แท้จริงออกมาในหน้าจอ Terminal
    console.error("❌ Error in likePostController:", error);

    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      if (error.message === "ALREADY_LIKED") {
        return res.status(409).json({
          message: "Post already liked",
        });
      }
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const unlikePostController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const { postId } = req.params;
    
    // @ts-ignore
    await unlikePost(userId, postId);

    return res.status(200).json({
      message: "Post unliked successfully",
    });
  } catch (error) {
    // 🛠️ บังคับพ่นเอเรอร์ที่แท้จริงออกมาในหน้าจอ Terminal
    console.error("❌ Error in unlikePostController:", error);

    if (error instanceof Error) {
      if (error.message === "LIKE_NOT_FOUND") {
        return res.status(404).json({
          message: "Like not found",
        });
      }
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
