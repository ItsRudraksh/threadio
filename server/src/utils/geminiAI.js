import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const enhanceContent = async (content) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: `As a social media expert, suggest improvements for this post to make it more engaging and effective: "${content}". 
          Provide suggestions in a JSON format with the following structure:
          {
            "originalContent": "the original content",
            "enhancedContent": "improved version",
            "suggestions": ["list of specific improvements"],
            "hashtags": ["relevant hashtags"]
          }
          
          Important: Return ONLY valid JSON with no markdown formatting, code blocks, or additional text.`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text().trim();

    // Try to safely parse the JSON by removing any markdown formatting
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // If still not parsed, try another approach
      const jsonStart = responseText.indexOf("{");
      const jsonEnd = responseText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
      }

      // If all methods fail, throw the original error
      console.error("Failed to parse JSON response:", responseText);
      throw parseError;
    }
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to enhance content");
  }
};

export const moderateContent = async (content) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: `Evaluate if this content contains inappropriate material that violates community guidelines: "${content}". 
          Respond with a JSON object with keys: "isAppropriate" (boolean), "reason" (string if inappropriate).
          
          Important: Return ONLY valid JSON with no markdown formatting, code blocks, or additional text.`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text().trim();

    // Try to safely parse the JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // If still not parsed, try another approach
      const jsonStart = responseText.indexOf("{");
      const jsonEnd = responseText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
      }

      // If all methods fail, throw the original error
      console.error("Failed to parse JSON response:", responseText);
      throw parseError;
    }
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to moderate content");
  }
};

export const generateImageCaption = async (imageBase64) => {
  try {
    console.log("Starting image caption generation process");

    // Extract the mime type and base64 data
    const mimeTypeMatch = imageBase64.match(
      /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/
    );

    if (!mimeTypeMatch) {
      throw new Error(
        "Invalid image format. Must be a base64 encoded data URL."
      );
    }

    const mimeType = mimeTypeMatch[1];
    console.log("Image MIME type:", mimeType);

    // Check if mime type is an image
    if (!mimeType.startsWith("image/")) {
      throw new Error("Provided data is not an image.");
    }

    // Extract the base64 data by removing the prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    console.log("Base64 data extracted, length:", base64Data.length);

    // Using the vision-compatible model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    console.log("Creating image parts for Gemini AI");
    // Create image parts from base64 string
    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ];

    console.log("Sending request to Gemini AI for caption generation");
    // Generate image caption
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: "Create an engaging social media caption for this image. The caption should be catchy, include relevant emojis, and have a conversational tone like people use on Instagram or Twitter. Make it feel personal and relatable, not just descriptive. Include 2-3 relevant hashtags at the end. MAKE SURE ITS NOT MORE THAN 500 CHARACTERS.",
            },
            ...imageParts,
          ],
        },
      ],
    });

    console.log("Received response from Gemini AI");
    const responseText = result.response.text().trim();
    console.log("Caption generated:", responseText.substring(0, 50) + "...");

    return {
      caption: responseText,
    };
  } catch (error) {
    console.error("Image Caption Error:", error);
    console.error("Error stack:", error.stack);
    throw new Error(`Failed to generate image caption: ${error.message}`);
  }
};

export const generateChatSuggestions = async (conversationHistory) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    // Format conversation history for the AI
    let formattedConversation = "";
    conversationHistory.forEach((msg) => {
      const sender = msg.isUserMessage ? "User" : "Other person";
      let messageContent = msg.text || "";
      if (msg.img) {
        messageContent += " [shared an image]";
      }
      if (msg.deleted) {
        messageContent = "[This message was deleted]";
      }
      formattedConversation += `${sender}: ${messageContent}\n`;
    });

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: `The following is a conversation between two people. Based on this conversation, generate 3 relevant, natural-sounding responses that the user could send next.

Conversation History:
${formattedConversation}

Generate exactly 3 different response options that are contextually relevant, conversational, and varied in tone and content. Format your answer as a JSON array with 3 strings:

Important: Return ONLY valid JSON array with no markdown formatting, code blocks, or additional text.`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text().trim();

    // Try to safely parse the JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // If still not parsed, try another approach
      const jsonStart = responseText.indexOf("[");
      const jsonEnd = responseText.lastIndexOf("]");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
      }

      // If all methods fail, return a default array with the error
      console.error("Failed to parse JSON response:", responseText);
      return [
        "I'd like to continue our conversation.",
        "That's interesting. Let me respond to that.",
        "I'm not sure what to say next.",
      ];
    }
  } catch (error) {
    console.error("Chat Suggestions Error:", error);
    // Return default suggestions if there's an error
    return [
      "I'd like to continue our conversation.",
      "That's interesting. Let me respond to that.",
      "I'm not sure what to say next.",
    ];
  }
};
