import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const enhanceContent = async (content) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", tools: [
    {
      googleSearch: {},
    },
  ], });
    const result = await model.generateContent({
      contents: [{
        parts: [{
          text: `As a social media expert, suggest improvements for this post to make it more engaging and effective: "${content}". 
          Provide suggestions in a JSON format with the following structure:
          {
            "originalContent": "the original content",
            "enhancedContent": "improved version",
            "suggestions": ["list of specific improvements"],
            "hashtags": ["relevant hashtags"]
          }
          
          Important: Return ONLY valid JSON with no markdown formatting, code blocks, or additional text.`
        }]
      }]
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
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", tools: [
    {
      googleSearch: {},
    },
  ], });
    const result = await model.generateContent({
      contents: [{
        parts: [{
          text: `Evaluate if this content contains inappropriate material that violates community guidelines: "${content}". 
          Respond with a JSON object with keys: "isAppropriate" (boolean), "reason" (string if inappropriate).
          
          Important: Return ONLY valid JSON with no markdown formatting, code blocks, or additional text.`
        }]
      }]
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
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      
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
    // Using the vision-compatible model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    // Create image parts from base64 string
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""),
          mimeType: imageBase64.includes("data:image/png") ? "image/png" : "image/jpeg"
        }
      }
    ];

    // Generate image caption
    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: "Create an engaging social media caption for this image. The caption should be catchy, include relevant emojis, and have a conversational tone like people use on Instagram or Twitter. Make it feel personal and relatable, not just descriptive. Include 2-3 relevant hashtags at the end. MAKE SURE ITS NOT MORE THAN 500 CHARACTERS." },
          ...imageParts
        ]
      }]
    });
    
    const responseText = result.response.text().trim();
    
    return {
      caption: responseText
    };
  } catch (error) {
    console.error("Image Caption Error:", error);
    throw new Error("Failed to generate image caption");
  }
}; 