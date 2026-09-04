import { Request, Response } from "express";

import {
  joinClub,
  leaveClub,
  kickMember,
  getClubMemberHistory,
  inviteMember,
} from "../services/clubMember.service";

// =========================
// JOIN CLUB
// =========================
export const joinClubController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { clubId } = req.params;

    const member = await joinClub(
    // @ts-ignore
      clubId,
      userId
    );

    return res.status(201).json({
      message: "Joined club successfully",
      data: member,
    });
  } catch (error: any) {
    switch (error.message) {
      case "CLUB_NOT_FOUND":
        return res.status(404).json({
          message: "Club not found",
        });

      case "CLUB_NOT_OPEN":
        return res.status(403).json({
          message:
            "This club is not open for joining",
        });

      case "ALREADY_MEMBER":
        return res.status(409).json({
          message:
            "You are already a member of this club",
        });

      case "CLUB_FULL":
        return res.status(409).json({
          message: "Club is full",
        });

      default:
        console.error(error);

        return res.status(500).json({
          message: "Internal server error",
        });
    }
  }
};

// =========================
// LEAVE / DELETE CLUB
// =========================
export const leaveClubController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { clubId } = req.params;

    const result = await leaveClub(
        // @ts-ignore
      clubId,
      userId
    );

    if (result.deleted) {
      return res.status(200).json({
        message: "Club deleted successfully",
      });
    }

    return res.status(200).json({
      message: "Left club successfully",
    });
  } catch (error: any) {
    switch (error.message) {
      case "CLUB_NOT_FOUND":
        return res.status(404).json({
          message: "Club not found",
        });

      case "NOT_MEMBER":
        return res.status(404).json({
          message:
            "You are not a member of this club",
        });

      default:
        console.error(error);

        return res.status(500).json({
          message: "Internal server error",
        });
    }
  }
};

// =========================
// KICK MEMBER
// =========================
export const kickMemberController = async (
  req: Request,
  res: Response
) => {
  try {
    const ownerId = req.user!.id;
    const { clubId } = req.params;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    await kickMember(
      ownerId,
      targetUserId,
      // @ts-ignore
      clubId
    );

    return res.status(200).json({
      message: "Member kicked successfully",
    });
  } catch (error: any) {
    switch (error.message) {
      case "CLUB_NOT_FOUND":
        return res.status(404).json({
          message: "Club not found",
        });

      case "OWNER_ONLY":
        return res.status(403).json({
          message:
            "Only the club owner can kick members",
        });

      case "OWNER_CANNOT_KICK_SELF":
        return res.status(403).json({
          message:
            "Club owner cannot kick themselves",
        });

      case "NOT_MEMBER":
        return res.status(404).json({
          message:
            "User is not a member of this club",
        });

      default:
        console.error(error);

        return res.status(500).json({
          message: "Internal server error",
        });
    }
  }
};

// =========================
// GET HISTORY
// =========================
export const getClubMemberHistoryController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.user!.id;
      const { clubId } = req.params;

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 20,
          1
        ),
        100
      );

      const start = Math.max(
        Number(req.query.start) || 0,
        0
      );

      const history =
        await getClubMemberHistory(
            // @ts-ignore
          clubId,
          userId,
          limit,
          start
        );

      return res.status(200).json({
        data: history,
        limit,
        start,
      });
    } catch (error: any) {
      switch (error.message) {
        case "CLUB_NOT_FOUND":
          return res.status(404).json({
            message: "Club not found",
          });

        case "NOT_MEMBER":
          return res.status(403).json({
            message:
              "You are not a member of this club",
          });


        case "OWNER_ONLY":
          return res.status(403).json({
            message:
              "Only the club owner can view member history",
          });

        default:
          console.error(error);

          return res.status(500).json({
            message: "Internal server error",
          });
      }
    }
  };

// =========================
// INVITE MEMBER
// =========================
export const inviteMemberController = async (
  req: Request,
  res: Response
) => {
  try {
    const inviterId = req.user!.id;
    const { clubId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const notification =
      await inviteMember(
        // @ts-ignore
        clubId,
        inviterId,
        userId
      );

    return res.status(201).json({
      message:
        "Club invitation sent successfully",
      data: notification,
    });
  } catch (error: any) {
    switch (error.message) {
      case "CLUB_NOT_FOUND":
        return res.status(404).json({
          message: "Club not found",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          message: "User not found",
        });

      case "NOT_MEMBER":
        return res.status(403).json({
          message:
            "You must be a member of this club to invite users",
        });

      case "CANNOT_INVITE_SELF":
        return res.status(400).json({
          message: "You cannot invite yourself",
        });

      case "ALREADY_MEMBER":
        return res.status(409).json({
          message:
            "User is already a member of this club",
        });

      case "CLUB_FULL":
        return res.status(409).json({
          message: "Club is full",
        });

      case "INVITATION_ALREADY_SENT":
        return res.status(409).json({
          message:
            "An invitation has already been sent to this user",
        });

      default:
        console.error(error);

        return res.status(500).json({
          message: "Internal server error",
        });
    }
  }
};