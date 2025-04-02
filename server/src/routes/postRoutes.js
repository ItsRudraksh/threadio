import express from "express";
import {
  createPost,
  deletePost,
  getFeedPosts,
  getPost,
  getUserPosts,
  getUserReplies,
  likeUnlikePost,
  replyToPost,
} from "../controllers/postController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/feed", verifyToken, getFeedPosts);
router.post("/create", verifyToken, createPost);
router.delete("/:id", verifyToken, deletePost);
router.put("/like/:id", verifyToken, likeUnlikePost);
router.put("/reply/:id", verifyToken, replyToPost);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.get("/user/:username/replies", getUserReplies);

export default router;
