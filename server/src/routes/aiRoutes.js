import express from "express";
import { enhancePostContent, checkContentModeration, generateCaption } from "../controllers/aiController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Route to enhance post content
router.post("/enhance", verifyToken, enhancePostContent);

// Route to check content moderation
router.post("/moderate", verifyToken, checkContentModeration);

// Route to generate image captions
router.post("/generate-caption", verifyToken, generateCaption);

export default router; 