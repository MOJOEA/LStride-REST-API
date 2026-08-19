import { Router } from "express";
import {createPostController, updatePostController, getPostsController, getPostByIdController,} from "../controllers/post.controller";
import { uploadPostImage } from "../middleware/upload_post.middleware";

const router = Router();

router.get("/",getPostsController);
router.get("/:id",getPostByIdController);

router.post("/",uploadPostImage.single("image"),createPostController);
router.put("/:id",uploadPostImage.single("image"),updatePostController);

export default router;