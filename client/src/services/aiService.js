export const enhancePostContent = async (content) => {
  try {
    const res = await fetch("http://localhost:5000/api/v1/ai/enhance", {
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
    const res = await fetch("http://localhost:5000/api/v1/ai/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      credentials: "include",
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
    // Include detailed error handling for debugging
    console.log(
      "Sending image caption request, image data length:",
      image.length
    );

    // Verify the image format
    if (!image || !image.startsWith("data:image/")) {
      throw new Error(
        "Invalid image format. Must be a base64 encoded data URL."
      );
    }

    const res = await fetch("http://localhost:5000/api/v1/ai/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
      credentials: "include",
    });

    // Check for non-JSON responses
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Received non-JSON response:", text.substring(0, 200));
      throw new Error(
        `Server returned non-JSON response: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
    }

    console.log(
      "Caption received:",
      data.caption ? "Success" : "Empty caption"
    );
    return data;
  } catch (error) {
    console.error("Error generating image caption:", error);
    throw new Error(`Failed to generate caption: ${error.message}`);
  }
};
