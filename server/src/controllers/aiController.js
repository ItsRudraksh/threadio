import {
  enhanceContent,
  moderateContent,
  generateImageCaption,
  generateChatSuggestions,
} from "../utils/geminiAI.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

export const enhancePostContent = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const enhancedResult = await enhanceContent(content);
    res.json(enhancedResult);
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    res.status(500).json({ error: "Failed to enhance content" });
  }
};

export const checkContentModeration = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const moderationResult = await moderateContent(content);
    res.json(moderationResult);
  } catch (error) {
    console.error("Content Moderation Error:", error);
    res.status(500).json({ error: "Failed to moderate content" });
  }
};

export const generateCaption = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    console.log("Received image data, length:", image.length);

    // Check for valid base64 format
    if (!image.startsWith("data:image/")) {
      return res
        .status(400)
        .json({
          error: "Invalid image format. Must be base64 encoded data URL.",
        });
    }

    // Log that we're calling the AI service
    console.log("Calling Gemini AI for image caption generation");

    const captionResult = await generateImageCaption(image);

    // Log successful response
    console.log(
      "Caption generated successfully:",
      captionResult.caption ? "Caption received" : "No caption"
    );

    res.json(captionResult);
  } catch (error) {
    console.error("Image Caption Generation Error:", error);
    // Send a more detailed error response
    res.status(500).json({
      error: "Failed to generate image caption",
      details: error.message,
    });
  }
};

export const getChatSuggestions = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    // Validate the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Verify the user is part of this conversation
    if (!conversation.participants.includes(currentUserId)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to access this conversation" });
    }

    // Get messages from this conversation
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(20);

    // Format messages for the AI
    const formattedMessages = messages.map((msg) => ({
      isUserMessage: msg.sender.toString() === currentUserId,
      text: msg.text,
      img: msg.img,
      deleted: msg.deleted || false,
    }));

    // Generate suggestions
    const suggestions = await generateChatSuggestions(formattedMessages);

    // Return the suggestions
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Chat Suggestions Error:", error);
    res.status(500).json({ error: "Failed to generate chat suggestions" });
  }
};
