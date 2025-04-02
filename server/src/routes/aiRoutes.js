import express from "express";
import {
  enhancePostContent,
  checkContentModeration,
  generateCaption,
  getChatSuggestions,
} from "../controllers/aiController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Route to enhance post content
router.post("/enhance", verifyToken, enhancePostContent);

// Route to check content moderation
router.post("/moderate", verifyToken, checkContentModeration);

// Route to generate image captions - make sure both endpoints work
router.post("/caption", verifyToken, generateCaption);
router.post("/generate-caption", verifyToken, generateCaption); // Add this alias for backward compatibility

// Route to get chat suggestions
router.get(
  "/chat-suggestions/:conversationId",
  verifyToken,
  getChatSuggestions
);

export default router;
