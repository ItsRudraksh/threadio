import { enhanceContent, moderateContent, generateImageCaption } from "../utils/geminiAI.js";

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

    const captionResult = await generateImageCaption(image);
    res.json(captionResult);
  } catch (error) {
    console.error("Image Caption Generation Error:", error);
    res.status(500).json({ error: "Failed to generate image caption" });
  }
}; 