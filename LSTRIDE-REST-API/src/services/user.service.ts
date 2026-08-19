import { OAuth2Client } from "google-auth-library";

import { prisma } from "../lib/prisma";

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: { id: true, name: true, gender: true, email: true, bio: true, profileImage: true,
    _count: { select: { following: true, followers: true,},},
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    name: user.name,
    gender: user.gender,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    followingCount: user._count.following,
    followerCount: user._count.followers,
  };
};

export const updateProfile = async (
  userId: string,
  data: {
    name?: string;
    gender?: string;
    bio?: string;
  },
  profileImage?: string
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...data,
      ...(profileImage && { profileImage }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      bio: true,
      profileImage: true,
    },
  });
};