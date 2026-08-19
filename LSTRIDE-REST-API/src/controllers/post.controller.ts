import { Request, Response } from "express";
import {
    createPost,
    updatePost,
    getPosts,
    getPostById,
} from "../services/post.service";

export const createPostController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const image = req.file
      ? `/uploads/posts/${req.file.filename}`
      : undefined;

    const {
      title,
      content,
      clubId,
      workoutTemplateId,
      activityHistoryId,
    } = req.body;

        if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Content is required",
      });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const post = await createPost({
      creatorId: userId, 
      content,
      title: title || undefined, 
      image: image || undefined, 
      clubId: clubId || undefined, 
      workoutTemplateId: workoutTemplateId || undefined, 
      activityHistoryId: activityHistoryId || undefined
    });


    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create post",
    });
  }
};

export const updatePostController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const image = req.file
      ? `/uploads/posts/${req.file.filename}`
      : undefined;

    const {
      title,
      content,
      clubId,
      workoutTemplateId,
      activityHistoryId,
    } = req.body;


    const post = await updatePost(
        // @ts-ignore
      id, userId,
      {
        content,
        title: title || undefined,
        image: image || undefined,
        clubId: clubId || undefined,
        workoutTemplateId: workoutTemplateId || undefined,
        activityHistoryId: activityHistoryId || undefined,
      }
    );

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      if (error.message === "FORBIDDEN") {
        return res.status(403).json({
          message: "You can only edit your own post",
        });
      }
    }

    return res.status(500).json({
      message: "Failed to update post",
    });
  }
};


export const getPostsController = async (
  req: Request,
  res: Response
) => {
  try {
    const limitParam = req.query.limit;

    const limit = limitParam
      ? Number(limitParam)
      : 50;

    if (!Number.isInteger(limit) || limit < 1) {
      return res.status(400).json({
        message: "Limit must be a positive integer",
      });
    }

    if (limit > 100) {
      return res.status(400).json({
        message: "Limit cannot exceed 100",
      });
    }

    const posts = await getPosts(limit);

    return res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get posts",
    });
  }
};

export const getPostByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      post,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get post",
    });
  }
};