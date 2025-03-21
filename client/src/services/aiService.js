export const enhancePostContent = async (content) => {
  try {
    const res = await fetch("/api/v1/ai/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error enhancing post:", error);
    throw error;
  }
};

export const checkContentModeration = async (content) => {
  try {
    const res = await fetch("/api/v1/ai/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error checking content:", error);
    throw error;
  }
};

export const generateImageCaption = async (image) => {
  try {
    const res = await fetch("/api/v1/ai/generate-caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error generating image caption:", error);
    throw error;
  }
};