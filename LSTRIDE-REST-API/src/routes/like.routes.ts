import { Router } from "express";
import { likePostController, unlikePostController } from "../controllers/like.controller";

const router = Router();

router.post("/:postId",likePostController);
router.delete("/:postId",unlikePostController);

export default router;