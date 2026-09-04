import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";

export const createClub = async (
  creatorId: string,
  data: {
    name: string;
    description?: string;
    joinPolicy?: "OPEN" | "INVITE_ONLY";
    profileImage?: string;
    bannerImage?: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const club = await tx.club.create({
        // @ts-ignore
      data: {
        creatorId,
        name: data.name,
        description: data.description,
        joinPolicy: data.joinPolicy ?? "OPEN",
        profileImage: data.profileImage,
        bannerImage: data.bannerImage,
        chatId: randomUUID(),
      },
    });

    await tx.clubMember.create({
      data: {
        userId: creatorId,
        clubId: club.id,
        role: "OWNER",
      },
    });

    return club;
  });
};

export const updateClub = async (
  clubId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    joinPolicy?: "OPEN" | "INVITE_ONLY";
    profileImage?: string;
    bannerImage?: string;
  }
) => {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
    select: {
      creatorId: true,
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  if (club.creatorId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.club.update({
    where: {
      id: clubId,
    },
    // @ts-ignore
    data: {
      name: data.name,
      description: data.description,
      joinPolicy: data.joinPolicy,
      profileImage: data.profileImage,
      bannerImage: data.bannerImage,
    },
  });
};

export const deleteClub = async (
  clubId: string,
  userId: string
) => {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
    select: {
      creatorId: true,
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  if (club.creatorId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.club.delete({
    where: {
      id: clubId,
    },
  });
};

export const getClubs = async (
  limit: number,
  start: number,
  name?: string
) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  return prisma.club.findMany({
    where: name
      ? {
          name: {
            contains: name,
            mode: "insensitive",
          },
        }
      : undefined,

    skip: start,
    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      name: true,
      description: true,
      profileImage: true,
      bannerImage: true,

      creator: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },

      _count: {
        select: {
          members: true,
        },
      },
    },
  });
};

export const getClubById = async (
  clubId: string,
  userId: string
) => {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
    select: {
      id: true,
      creatorId: true,
      name: true,
      description: true,
      bannerImage: true,
      profileImage: true,
      joinPolicy: true,
      chatId: true,
      createdAt: true,
      updatedAt: true,

      creator: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },

      _count: {
        select: {
          members: true,
        },
      },

      activities: {
        orderBy: {
          scheduledAt: "asc",
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  const isOwner = club.creatorId === userId;

  // ค้นหาว่า user คนนี้อยู่ในคลับไหม โดยไม่ต้องดึง status มาแล้ว
  const member = await prisma.clubMember.findUnique({
    where: {
      userId_clubId: {
        userId,
        clubId,
      },
    },
    select: {
      id: true,
    },
  });

  // ถ้ามีแถวข้อมูลอยู่ในตาราง clubMember แปลว่าเป็นสมาชิกทันที
  const isMember = !!member;

  if (isOwner || isMember) {
    return club;
  }

  const { activities, ...clubWithoutActivities } = club;

  return clubWithoutActivities;
};
