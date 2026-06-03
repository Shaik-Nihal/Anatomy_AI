import axios from "axios";

const API_BASE =
  import.meta.env.VITE_QUIZ_API_BASE_URL ?? "http://127.0.0.1:8000";
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
