import { ClubMemberHistoryAction } from "@prisma/client";
import { prisma } from "../lib/prisma";

const MAX_MEMBERS = 100;

// =========================
// JOIN CLUB
// =========================
export const joinClub = async (
  clubId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const club = await tx.club.findUnique({
      where: {
        id: clubId,
      },
    });

    if (!club) {
      throw new Error("CLUB_NOT_FOUND");
    }

    if (club.joinPolicy !== "OPEN") {
      throw new Error("CLUB_NOT_OPEN");
    }

    const existingMember = await tx.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (existingMember) {
      throw new Error("ALREADY_MEMBER");
    }

    const memberCount = await tx.clubMember.count({
      where: {
        clubId,
      },
    });

    if (memberCount >= MAX_MEMBERS) {
      throw new Error("CLUB_FULL");
    }

    const member = await tx.clubMember.create({
      data: {
        clubId,
        userId,
      },
    });

    await tx.clubMemberHistory.create({
      data: {
        clubId,
        userId,
        action: ClubMemberHistoryAction.JOIN,
      },
    });

    return member;
  });
};

// =========================
// LEAVE CLUB
// =========================
// สมาชิกทั่วไป = ออกจากตัวเอง
// Owner = ยุบ Club
// =========================
export const leaveClub = async (
  clubId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const club = await tx.club.findUnique({
      where: {
        id: clubId,
      },
    });

    if (!club) {
      throw new Error("CLUB_NOT_FOUND");
    }

    // =========================
    // OWNER → DELETE CLUB
    // =========================
    if (club.creatorId === userId) {
      await tx.club.delete({
        where: {
          id: clubId,
        },
      });

      return {
        deleted: true,
        clubId,
      };
    }

    // =========================
    // MEMBER → LEAVE
    // =========================
    const member = await tx.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!member) {
      throw new Error("NOT_MEMBER");
    }

    await tx.clubMember.delete({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    await tx.clubMemberHistory.create({
      data: {
        clubId,
        userId,
        action: ClubMemberHistoryAction.LEAVE,
      },
    });

    return {
      deleted: false,
      clubId,
      userId,
    };
  });
};

// =========================
// KICK MEMBER
// =========================
// Owner เท่านั้น
// =========================
export const kickMember = async (
  ownerId: string,
  targetUserId: string,
  clubId: string
) => {
  return prisma.$transaction(async (tx) => {
    // =========================
    // CHECK CLUB
    // =========================
    const club = await tx.club.findUnique({
      where: {
        id: clubId,
      },
    });

    if (!club) {
      throw new Error("CLUB_NOT_FOUND");
    }

    // =========================
    // CHECK SELF KICK
    // =========================
    if (ownerId === targetUserId) {
      throw new Error(
        "OWNER_CANNOT_KICK_SELF"
      );
    }

    // =========================
    // CHECK OWNER
    // =========================
    if (club.creatorId !== ownerId) {
      throw new Error("OWNER_ONLY");
    }

    // =========================
    // CHECK TARGET MEMBER
    // =========================
    const member = await tx.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: targetUserId,
          clubId,
        },
      },
    });

    if (!member) {
      throw new Error("NOT_MEMBER");
    }

    // =========================
    // DELETE MEMBER
    // =========================
    await tx.clubMember.delete({
      where: {
        userId_clubId: {
          userId: targetUserId,
          clubId,
        },
      },
    });

    // =========================
    // HISTORY
    // =========================
    await tx.clubMemberHistory.create({
      data: {
        clubId,
        userId: targetUserId,
        action: ClubMemberHistoryAction.LEAVE,
      },
    });

    return {
      clubId,
      ownerId,
      userId: targetUserId,
    };
  });
};
// =========================
// GET MEMBER HISTORY
// =========================
export const getClubMemberHistory = async (
  clubId: string,
  userId: string,
  limit: number,
  start: number
) => {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  if (club.creatorId !== userId) {
    throw new Error("OWNER_ONLY");
  }

  const history =
    await prisma.clubMemberHistory.findMany({
      where: {
        clubId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: start,
      take: limit,
      select: {
        id: true,
        clubId: true,
        userId: true,
        action: true,
        createdAt: true,
      },
    });

  return history;
};

// =========================
// INVITE MEMBER
// =========================
export const inviteMember = async (
  clubId: string,
  inviterId: string,
  targetUserId: string
) => {
  return prisma.$transaction(async (tx) => {
    const club = await tx.club.findUnique({
      where: {
        id: clubId,
      },
    });

    if (!club) {
      throw new Error("CLUB_NOT_FOUND");
    }

    // คนเชิญต้องเป็นสมาชิก
    const inviter = await tx.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId: inviterId,
          clubId,
        },
      },
    });

    // Owner สามารถเชิญได้
    if (!inviter && club.creatorId !== inviterId) {
      throw new Error("NOT_MEMBER");
    }

    if (inviterId === targetUserId) {
      throw new Error("CANNOT_INVITE_SELF");
    }

    const targetUser = await tx.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!targetUser) {
      throw new Error("USER_NOT_FOUND");
    }

    const existingMember =
      await tx.clubMember.findUnique({
        where: {
          userId_clubId: {
            userId: targetUserId,
            clubId,
          },
        },
      });

    if (existingMember) {
      throw new Error("ALREADY_MEMBER");
    }

    const memberCount =
      await tx.clubMember.count({
        where: {
          clubId,
        },
      });

    if (memberCount >= MAX_MEMBERS) {
      throw new Error("CLUB_FULL");
    }

    // ป้องกันส่ง Invitation ซ้ำ
    const existingInvitation =
      await tx.notification.findFirst({
        where: {
          receiverId: targetUserId,
          clubId,
          type: "CLUB_INVITATION",
          readAt: null,
        },
      });

    if (existingInvitation) {
      throw new Error(
        "INVITATION_ALREADY_SENT"
      );
    }

    const notification =
      await tx.notification.create({
        data: {
          receiverId: targetUserId,
          clubId,
          userId: inviterId,
          type: "CLUB_INVITATION",
          data: {
            clubId,
            inviterId,
          },
        },
      });

    return notification;
  });
};