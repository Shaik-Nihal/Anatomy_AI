import axios from "axios";

const API_BASE =
  import.meta.env.VITE_QUIZ_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const QUIZ_API_URL = `${API_BASE}/api`;
const PROGRESS_API_URL = `${API_BASE}/progress`;

export const generateQuiz = async (organ, difficulty) => {
  const response = await axios.post(`${QUIZ_API_URL}/generate-quiz`, {
    organ,
    difficulty,
  });

  return response.data;
};

export const saveQuizResult = async ({
  userId,
  organ,
  difficulty,
  score,
  totalQuestions,
  percentage,
  weakAreas,
}) => {
  const response = await axios.post(`${PROGRESS_API_URL}/save-result`, {
    user_id: userId,
    organ,
    difficulty,
    score,
    total_questions: totalQuestions,
    percentage,
    weak_areas: weakAreas,
  });

  return response.data;
};

export const getUserProgress = async (userId) => {
  const response = await axios.get(`${PROGRESS_API_URL}/user/${userId}`);
  return response.data;
};

export const sendTutorQuestion = async (question, conversationalMode = false) => {
  const response = await axios.post(`${QUIZ_API_URL}/tutor`, { 
    question,
    conversational_mode: conversationalMode
  });
  return response.data;
};

export const getTutorProgress = async (userId) => {
  const response = await axios.get(`${PROGRESS_API_URL}/tutor/${userId}`);
  return response.data;
};

export const resetUserProgress = async (userId) => {
  const response = await axios.delete(`${PROGRESS_API_URL}/user/${userId}`);
  return response.data;
};

export const getTutorSpeech = async (text, voice = "alloy") => {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("voice", voice);
  
  const response = await axios.post(`${API_BASE}/voice/speak`, formData, {
    responseType: "blob"
  });
  return response.data;
};

