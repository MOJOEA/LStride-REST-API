import { Router } from "express";
import {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/comment.controller";

const router = Router();

router.post(
  "/:postId",
  createCommentController
);

router.get(
  "/:postId",
  getCommentsController
);

router.put(
  "/:commentId",
  updateCommentController
);

router.delete(
  "/:commentId",
  deleteCommentController
);

export default router;