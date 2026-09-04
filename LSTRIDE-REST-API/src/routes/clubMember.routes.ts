import { Router } from "express";

import {
  joinClubController,
  leaveClubController,
  kickMemberController,
  getClubMemberHistoryController,
  inviteMemberController,
} from "../controllers/clubMember.controller";

const router = Router();

// เข้าร่วม Club
router.post(
  "/:clubId/join",
  joinClubController
);

// ออกจาก Club ตัวเอง
router.delete(
  "/:clubId/leave",
  leaveClubController
);

// Owner เตะสมาชิก
router.delete(
  "/:clubId/kick",
  kickMemberController
);

// ประวัติสมาชิก
router.get(
  "/:clubId/history",
  getClubMemberHistoryController
);

// เชิญสมาชิก
router.post(
  "/:clubId/invite",
  inviteMemberController
);

export default router;