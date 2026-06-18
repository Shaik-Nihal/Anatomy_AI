const API_BASE_URL = "http://127.0.0.1:8000";

export const identifyOrgan = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/vision/identify`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to identify organ. Server responded with an error.");
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error identifying organ:", error);
    throw error;
  }
};
