import { prisma } from "../lib/prisma";

interface CreatePostData {
  creatorId: string;
  title?: string;
  content: string;
  image?: string;
  clubId?: string;
  workoutTemplateId?: string;
  activityHistoryId?: string;
}

interface UpdatePostData {
  title?: string;
  content?: string;
  image?: string;
  clubId?: string;
  workoutTemplateId?: string;
  activityHistoryId?: string;
}

export const getPosts = async (limit: number, start: number) => {
  return prisma.post.findMany({
    skip: start,
    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      creator: {
        select: { id: true, name: true, email: true, profileImage: true,},
      },

      _count: {
        select: { likes: true, },
      },
    },
  });
};

export const getPostById = async (postId: string) => {
  return prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, profileImage: true,},
      },

      _count: {
        select: { likes: true, },
      },
    },
  });
};

export const getPostClubById = async (clubId: string) => {
  return prisma.post.findMany({
    where: {
      clubId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, profileImage: true,},
      },

      _count: {
        select: { likes: true, },
      },
    },
  });
};

export const createPost = async (
  data: CreatePostData
) => {
  return prisma.post.create({
    // @ts-ignore
    data: {
      creatorId: data.creatorId,
      title: data.title,
      content: data.content,
      image: data.image,
      clubId: data.clubId,
      workoutTemplateId: data.workoutTemplateId,
      activityHistoryId: data.activityHistoryId,
    },
  });
};

export const updatePost = async (
  postId: string,
  userId: string,
  data: UpdatePostData
) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  if (post.creatorId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.post.update({
    where: {
      id: postId,
    },
    // @ts-ignore
    data: {
      title: data.title,
      content: data.content,
      image: data.image,
      clubId: data.clubId,
      workoutTemplateId: data.workoutTemplateId,
      activityHistoryId: data.activityHistoryId,
    },
  });
};