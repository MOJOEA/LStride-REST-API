import { prisma } from "../lib/prisma";

export const likePost = async (
  userId: string,
  postId: string
) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    throw new Error("ALREADY_LIKED");
  }

  return await prisma.like.create({
    data: {
      userId,
      postId,
    },
  });
};

export const unlikePost = async (
  userId: string,
  postId: string
) => {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!like) {
    throw new Error("LIKE_NOT_FOUND");
  }

  await prisma.like.delete({
    where: {
      id: like.id,
    },
  });
};