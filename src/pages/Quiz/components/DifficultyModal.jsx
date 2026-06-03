import React, { useState } from "react";
import { generateQuiz } from "../../../services/quizApi";

function DifficultyModal({
  organ,
  onClose,
  onStartQuiz
}) {
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");

 const handleDifficulty = async (level) => {
  try {
    setSelectedLevel(level);
    setLoading(true);
      const questions = await generateQuiz(
        organ,
        level
      );

      onStartQuiz({
        organ,
        difficulty: level,
        questions
      });

    } catch (error) {
      console.error(error);

      alert(
        "Failed to generate quiz. Check backend server."
      );

    } finally {
      setLoading(false);
    }
  };

  const organIcons = {
    Brain: "🧠",
    Heart: "🫀",
    Lungs: "🫁",
    Liver: "/organs/liver.png",
    Kidney: "🫘",
    Eye: "👁️",
    Ear: "👂",
    Stomach: "🫃",
    Bones: "🦴",
    Muscles: "💪",
    Intestines: "/organs/intestines.png",
  };

  return (
    <div className="modal-overlay">

      <div className="difficulty-modal">

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="modal-title">
          <span className="modal-icon">
  {organIcons[organ]?.startsWith?.("/") ? (
    <img
      src={organIcons[organ]}
      alt={organ}
      className="modal-organ-icon"
    />
  ) : (
    organIcons[organ]
  )}
</span>
          {organ}
        </h2>

       <p className="difficulty-subtitle">
  {loading
    ? `${selectedLevel} Level`
    : "Select Difficulty Level"}
</p>
       {loading ? (

  <div
    style={{
      color: "#06B6D4",
      textAlign: "center",
      marginTop: "20px",
      marginBottom: "20px",
      fontWeight: "600",
      fontSize: "18px"
    }}
  >
   <div className="quiz-loader">
  <div className="spinner"></div>
  <p>⌛Generating Quiz...</p>
</div>
  </div>

) : (

  <>
    <button
      className="difficulty-card easy"
      onClick={() => handleDifficulty("Easy")}
    >
      Easy
    </button>

    <button
      className="difficulty-card medium"
      onClick={() => handleDifficulty("Medium")}
    >
      Medium
    </button>

    <button
      className="difficulty-card hard"
      onClick={() => handleDifficulty("Hard")}
    >
      Hard
    </button>
  </>

)}

      </div>

    </div>
  );
}

export default DifficultyModal;

