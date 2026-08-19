import { Router } from "express";
import { followUserController, unfollowUserController } from "../controllers/follow.controller";

const router = Router();

router.post("/:userid",followUserController);
router.delete("/:userid", unfollowUserController);

export default router;