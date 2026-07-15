import { useState } from "react";
import QuizHome from "./QuizHome";
import QuizScreen from "./QuizScreen";
import { generateQuiz } from "../../services/quizApi";
import Navbar from "../../components/Navbar";
import "./styles/quiz.css";

function Quiz() {
  const [quizConfig, setQuizConfig] = useState(null);
  const [reloading, setReloading] = useState(false);

  const handleBackToHome = () => setQuizConfig(null);

  const handleRestartQuiz = async (organ, difficulty) => {
    try {
      setReloading(true);
      const questions = await generateQuiz(organ, difficulty);
      setQuizConfig({ organ, difficulty, questions });
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz. Check backend server.");
    } finally {
      setReloading(false);
    }
  };

  if (reloading) {
    return (
      <div className="quiz-root">
        <div
          className="quiz-loader"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div className="spinner"></div>
          <p style={{ color: "#06B6D4", marginTop: 16, fontWeight: 600 }}>
            ⌛Generating Quiz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-root">
      {!quizConfig && <Navbar />}
      {!quizConfig ? (
        <QuizHome onStartQuiz={setQuizConfig} />
      ) : (
        <QuizScreen
          key={`${quizConfig.organ}-${quizConfig.difficulty}-${Date.now()}`}
          organ={quizConfig.organ}
          difficulty={quizConfig.difficulty}
          questions={quizConfig.questions}
          onBack={handleBackToHome}
          onRestartQuiz={handleRestartQuiz}
        />
      )}
    </div>
  );
}

export default Quiz;
