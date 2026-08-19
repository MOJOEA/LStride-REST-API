import { prisma } from "../lib/prisma";
import { createHash } from "crypto";

export const followUser = async (
  followerId: string,
  followingId: string
) => {
  if (followerId === followingId) {
    throw new Error("CANNOT_FOLLOW_SELF");
  }

  const sortedIds = [followerId, followingId].sort();
  
  const sharedChatId = createHash("md5")
    .update(`${sortedIds[0]}_${sortedIds[1]}`)
    .digest("hex"); 

  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
  });

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (existingFollow) {
    throw new Error("ALREADY_FOLLOWING");
  }

  const result = await prisma.$transaction(async (tx) => {
    const follow = await tx.follow.create({
      data: {
        followerId,
        followingId,
        chatId: sharedChatId, // 🛠️ เปลี่ยนมาใช้ไอดีที่สร้างร่วมกันตรงนี้ครับ
      },
    });

    const notification = await tx.notification.create({
      data: {
        receiverId: followingId,
        userId: followerId,
        type: "NEW_FOLLOWER",
        data: { followerId },
      },
    });

    return { follow, notification };
  });

  return result;
};

export const unfollowUser = async (
  followerId: string,
  followingId: string
) => {
  // 1. ตรวจสอบว่าเคยติดตามกันอยู่จริงไหม
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!existingFollow) {
    throw new Error("NOT_FOLLOWING");
  }

  // 2. ลบข้อมูลการติดตามออกจากฐานข้อมูล
  return await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
};
