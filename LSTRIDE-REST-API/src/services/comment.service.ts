import { prisma } from "../lib/prisma";

export const createComment = async (
  userId: string,
  postId: string,
  content: string
) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  return prisma.comment.create({
    data: {
      userId,
      postId,
      content,
    },
  });
};

export const getCommentsByPost = async (postId: string) => {
  return prisma.comment.findMany({
    where: {
      postId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });
};

export const updateComment = async (
  userId: string,
  commentId: string,
  content: string
) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  if (comment.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content,
    },
  });
};

export const deleteComment = async (
  userId: string,
  commentId: string
) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  if (comment.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};