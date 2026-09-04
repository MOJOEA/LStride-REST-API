import { Visibility } from "@prisma/client";
import { prisma } from "../lib/prisma";

const creatorSelect = {
  id: true,
  name: true,
  profileImage: true,
};

const templateSelect = {
  id: true,
  name: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: creatorSelect,
  },
};

// ===============================
// CREATE
// ===============================

export const createWorkoutTemplate = async (
  creatorId: string,
  data: {
    name: string;
    description?: string;
    visibility?: Visibility;
  }
) => {
  return prisma.workoutTemplate.create({
    // @ts-ignore
    data: {
      creatorId,
      name: data.name,
      description: data.description,
      visibility: data.visibility ?? Visibility.PRIVATE,
    },
    select: templateSelect,
  });
};

// ===============================
// UPDATE
// ===============================

export const updateWorkoutTemplate = async (
  id: string,
  creatorId: string,
  data: {
    name?: string;
    description?: string;
    visibility?: Visibility;
  }
) => {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error("TEMPLATE_NOT_FOUND");
  }

  if (template.creatorId !== creatorId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.workoutTemplate.update({
    where: { id },
    data,
    select: templateSelect,
  });
};

// ===============================
// DELETE
// ===============================

export const deleteWorkoutTemplate = async (
  id: string,
  creatorId: string
) => {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error("TEMPLATE_NOT_FOUND");
  }

  if (template.creatorId !== creatorId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.workoutTemplate.delete({
    where: { id },
  });

  return {
    message: "Workout template deleted successfully",
  };
};

// ===============================
// GET PUBLIC + FOLLOWERS_ONLY
// ===============================

export const getPublicWorkoutTemplates = async (
  userId: string,
  limit: number
) => {
  // หา User ที่เราติดตาม
  const follows = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = follows.map(
    (follow) => follow.followingId
  );

  return prisma.workoutTemplate.findMany({
    where: {
        creatorId: {
        not: userId,
        },
        OR: [
        {
            visibility: Visibility.PUBLIC,
        },
        {
            visibility: Visibility.FOLLOWERS_ONLY,
            creatorId: {
            in: followingIds,
            },
        },
        ],
    },
    orderBy: {
        createdAt: "desc",
    },
    take: limit,
    select: templateSelect,
});
}

// ===============================
// GET MY TEMPLATES
// ===============================

export const getMyWorkoutTemplates = async (
  creatorId: string,
  limit: number
) => {
  return prisma.workoutTemplate.findMany({
    where: {
      creatorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: templateSelect,
  });
};

// ===============================
// GET FOLLOWING TEMPLATES
// ===============================

export const getFollowingWorkoutTemplates = async (
  userId: string,
  limit: number
) => {
  // หา Creator ที่เรา Follow
  const follows = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    select: {
      followingId: true,
    },
  });

  const followingIds = follows.map(
    (follow) => follow.followingId
  );

  return prisma.workoutTemplate.findMany({
    where: {
      creatorId: {
        in: followingIds,
      },
      visibility: Visibility.FOLLOWERS_ONLY,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: templateSelect,
  });
};

// ===============================
// GET BY ID
// ===============================

export const getWorkoutTemplateById = async (
  id: string,
  userId: string
) => {
  const template = await prisma.workoutTemplate.findUnique({
    where: {
      id,
    },
    select: {
      ...templateSelect,
      creatorId: true,
    },
  });

  if (!template) {
    throw new Error("TEMPLATE_NOT_FOUND");
  }

  // เจ้าของดูได้ทุก visibility
  if (template.creatorId === userId) {
    const { creatorId, ...result } = template;
    return result;
  }

  // PUBLIC → ทุกคนดูได้
  if (template.visibility === Visibility.PUBLIC) {
    const { creatorId, ...result } = template;
    return result;
  }

  // PRIVATE → คนอื่นดูไม่ได้
  if (template.visibility === Visibility.PRIVATE) {
    throw new Error("FORBIDDEN");
  }

  // FOLLOWERS_ONLY
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: template.creatorId,
      },
    },
  });

  if (!follow) {
    throw new Error("FORBIDDEN");
  }

  const { creatorId, ...result } = template;

  return result;
};