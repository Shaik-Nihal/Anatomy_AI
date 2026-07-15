const API_BASE_URL = import.meta.env.VITE_QUIZ_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const identifyOrgan = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/vision/identify`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorMsg = "Failed to identify organ. Server responded with an error.";
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) {
          errorMsg = errJson.detail;
        }
      } catch (e) {}
      throw new Error(errorMsg);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error identifying organ:", error);
    throw error;
  }
};

export const labelDiagram = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/vision/label`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      let errorMsg = "Failed to label diagram. Server responded with an error.";
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) {
          errorMsg = errJson.detail;
        }
      } catch (e) {}
      throw new Error(errorMsg);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error labeling diagram:", error);
    throw error;
  }
};
