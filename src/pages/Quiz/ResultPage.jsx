import React, { useEffect } from "react";
import { saveQuizResult } from "../../services/quizApi";

function ResultPage({
  score,
  totalQuestions,
  weakAreas,
  organ,
  difficulty,
  onRetry,       // restarts SAME quiz (same organ + same difficulty)
  onNextLevel,   // (nextDifficulty) => void  -- start medium/hard
  onHome,        // go to Other Topics
}) {
  const accuracy = totalQuestions
    ? Math.round((score / totalQuestions) * 100)
    : 0;

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("user"));
    const email = activeUser?.email || "temp_user";

    saveQuizResult({
      userId: email,
      organ,
      difficulty,
      score,
      totalQuestions,
      percentage: accuracy,
      weakAreas,
    })
      .then(() => {
        console.log("Quiz result saved");
      })
      .catch((err) => {
        console.error("Save failed:", err);
      });
  }, [accuracy, difficulty, organ, score, totalQuestions, weakAreas]);

  // Glow strength based on raw score
  const glowClass =
    score > 7 ? "glow-high" : score > 3 ? "glow-mid" : "glow-low";

  const heading =
    accuracy >= 80 ? "😃 Excellent"
    : accuracy >= 60 ? "😄 Good"
    : "🙁 Needs Improvement";

  const motivation =
    accuracy >= 80 ? "Excellent mastery of this topic! 🎉"
    : accuracy >= 60 ? "You're making good progress. Keep practicing! 🚀"
    : "Review the weak areas and try again. 💪";

  // Decide the second action button based on current difficulty
  const diff = (difficulty || "").toLowerCase();
  const nextAction =
    diff === "easy"   ? { label: "➡ Medium Level", onClick: () => onNextLevel?.("Medium") }
  : diff === "medium" ? { label: "🔥 Hard Level",   onClick: () => onNextLevel?.("Hard") }
  :                     { label: "🧬 Other Topics", onClick: onHome };

  return (
    <div className="result-page">
      <div className="result-wrapper">
        {/* LEFT: score + circle */}
        <section className="result-col score-col">
          <h1 className="result-title">🏆 Quiz Completed</h1>

          <div className={`accuracy-circle ${glowClass}`}>
            <span>{accuracy}%</span>
          </div>

          <h2 className="result-status">{heading}</h2>
          <p className="result-motivation">{motivation}</p>
        </section>

        {/* MIDDLE: details (no boxes) */}
        <section className="result-col info-col">
          <h3 className="info-heading">Quiz Details</h3>
          <p className="info-line"><span>Organ</span><strong>{organ}</strong></p>
          <p className="info-line"><span>Difficulty</span><strong>{difficulty}</strong></p>
          <p className="info-line"><span>Score</span><strong>{score}/{totalQuestions}</strong></p>
          <p className="info-line"><span>Accuracy</span><strong>{accuracy}%</strong></p>
        </section>

        {/* RIGHT: weak areas + actions */}
        <section className="result-col weak-col">
          <h3 className="info-heading">⚠ Weak Areas</h3>
          <div className="weak-tags">
            {weakAreas.length > 0 ? (
              weakAreas.map((area) => (
                <span key={area} className="weak-tag">{area}</span>
              ))
            ) : (
              <span className="weak-tag success">Excellent Performance</span>
            )}
          </div>

          <div className="result-actions">
            <button className="result-btn primary" onClick={onRetry}>
              🔄 Try Again
            </button>
            <button className="result-btn secondary" onClick={nextAction.onClick}>
              {nextAction.label}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResultPage;
