import { Request, Response } from "express";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../services/comment.service";

export const createCommentController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        message: "Content is required",
      });
    }

    const comment = await createComment(
      userId,
      // @ts-ignore
      postId,
      content
    );

    return res.status(201).json(comment);
  } catch (error: any) {
    if (error.message === "POST_NOT_FOUND") {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCommentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { postId } = req.params;
    // @ts-ignore
    const comments = await getCommentsByPost(postId);

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateCommentController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        message: "Content is required",
      });
    }

    const comment = await updateComment(
      userId,
      // @ts-ignore
      commentId,
      content
    );

    return res.status(200).json(comment);
  } catch (error: any) {
    if (error.message === "COMMENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message: "You can only edit your own comment",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteCommentController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { commentId } = req.params;
    // @ts-ignore
    await deleteComment(userId, commentId);

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "COMMENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message: "You can only delete your own comment",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};