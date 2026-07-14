import ResultPage from "./ResultPage";
import React, { useEffect, useState } from "react";
import { useGamification } from "../../contexts/GamificationContext";

function QuizScreen({
  organ,
  difficulty,
  questions = [],
  onBack,
  onRestartQuiz
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [matchAnswers, setMatchAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [weakAreas, setWeakAreas] = useState([]);
  const { addXP } = useGamification();
  const [xpAwarded, setXpAwarded] = useState(false);

  

  const getInitialTime = () => {
    if (difficulty === "Easy") return 30;
    if (difficulty === "Medium") return 25;
    return 20;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());

  

  const question = questions[currentQuestion];
  // Timer effect
  useEffect(() => {

  if (!question || showExplanation) return;

    if (timeLeft <= 0) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimeLeft(getInitialTime());
        setFillAnswer("");
      } else {
        if (!xpAwarded) {
          addXP(score * 20, "Quiz Completed");
          setXpAwarded(true);
        }
        setCurrentQuestion(questions.length);
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
  timeLeft,
  currentQuestion,
  question,
  questions.length,
  showExplanation
]);
  


// Quiz completed
if (!question) {

  const uniqueWeakAreas =
    [...new Set(weakAreas)];

  return (
  <ResultPage
    score={score}
    totalQuestions={questions.length}
    weakAreas={uniqueWeakAreas}
    organ={organ}
    difficulty={difficulty}
    onRetry={() => onRestartQuiz(organ, difficulty)}
    onNextLevel={(nextDifficulty) => onRestartQuiz(organ, nextDifficulty)}
    onHome={onBack}
  />
);

}


const handleAnswer = (answer) => {
  setSelectedAnswer(answer);

  let isCorrect = false;

  if (question.type === "mcq") {
  const correctOption =
    question.options[
      question.answer.charCodeAt(0) - 65
    ];

  isCorrect = answer === correctOption;
}

if (question.type === "true_false") {
  isCorrect = answer === question.answer;
}

  if (question.type === "fill_blank") {
    isCorrect =
      answer.trim().toLowerCase() ===
      question.answer.trim().toLowerCase();
  }
if (question.type === "fill_blank_option") {
  isCorrect =
    answer === question.answer;
}
  if (isCorrect) {
    setScore((prev) => prev + 1);
  } else {
    setWeakAreas((prev) => [
      ...prev,
      question.topic
    ]);
  }

  setShowExplanation(true);
};

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      if (!xpAwarded) {
        addXP(score * 20, "Quiz Completed");
        setXpAwarded(true);
      }
      setCurrentQuestion(questions.length);
    }

    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(getInitialTime());
    setFillAnswer("");
    setMatchAnswers({});
  };


  return (
    <div className={`min-h-screen p-4 md:p-10 ${organ?.toLowerCase()}`}>
      <div className="flex justify-between items-center max-w-[1100px] mx-auto">
        <h2 className="text-2xl font-bold">{organ} Quiz</h2>

        <div className="bg-slate-800 px-5 py-2.5 rounded-xl font-bold">
          ⏱ {timeLeft}s
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-5 h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-500 transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-10 bg-slate-800 p-6 md:p-9 rounded-3xl border border-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
        <div className="text-slate-300 mb-5 flex flex-col md:flex-row justify-between">
          <div
            style={{
              color: "#06B6D4",
              marginBottom: "10px",
            }}
          >
            Topic: {question.topic}
          </div>
          <div>
            Question {currentQuestion + 1} / {questions.length}
          </div>
        </div>

        <h3 className="max-w-[900px] leading-relaxed mb-6 text-xl md:text-2xl">
          {question.question}
        </h3>
        {question.type === "fill_blank" && (
          <div className="mt-5">
            <input
              type="text"
              value={fillAnswer}
              onChange={(e) =>
                setFillAnswer(e.target.value)
              }
              className="w-full p-3.5 rounded-xl border-2 border-cyan-500 bg-slate-800 text-white text-base outline-none"
              placeholder="Type your answer..."
            />

    <button
      className="next-btn"
      style={{ marginTop: "15px" }}
      onClick={() => handleAnswer(fillAnswer)}
    >
      Submit Answer
    </button>
  </div>
)}
{question.type === "fill_blank_option" && (
  <div className="flex flex-col gap-4 mt-5">
    {question.options?.map((option) => (
      <button
        key={option}
        className={`w-full md:w-[90%] mx-auto bg-slate-900 text-white border border-white/10 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] ${
          showExplanation
            ? option === question.answer
              ? "border-2 border-green-500 bg-green-500/15 text-green-500 hover:border-green-500 hover:shadow-none"
              : selectedAnswer === option
              ? "border-2 border-red-500 bg-red-500/15 text-red-500 hover:border-red-500 hover:shadow-none"
              : ""
            : ""
        }`}
        onClick={() => handleAnswer(option)}
        disabled={showExplanation}
      >
        {option}
      </button>
    ))}
  </div>
)}

{question.type !== "fill_blank" &&
 question.type !== "fill_blank_option" &&
 question.type !== "match" && (

        <div className="flex flex-col gap-4 mt-5">
          {question.options?.map((option) => {
            let correctOption;

            if (question.type === "mcq") {
              correctOption =
                question.options[
                  question.answer.charCodeAt(0) - 65
                ];
            }

            if (question.type === "true_false") {
              correctOption = question.answer;
            }
            return (
              <button
                key={option}
                className={`w-full md:w-[90%] mx-auto bg-slate-900 text-white border border-white/10 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] ${
                  showExplanation
                    ? option === correctOption
                      ? "border-2 border-green-500 bg-green-500/15 text-green-500 hover:border-green-500 hover:shadow-none"
                      : selectedAnswer === option
                      ? "border-2 border-red-500 bg-red-500/15 text-red-500 hover:border-red-500 hover:shadow-none"
                      : ""
                    : ""
                }`}
                onClick={() => handleAnswer(option)}
                disabled={showExplanation}
              >
                {option}
              </button>
            );
          })}
        </div>
        )}
        {question?.type === "match" &&
 question.left &&
 question.right && (

<div className="match-container">

  <div className="match-grid">

    <div>
      <h4>Left Side</h4>

      {question.left.map((item, index) => (
  <div
    key={item}
    style={{
      marginBottom: "20px",
      fontWeight: "600"
    }}
  >
     {item.replace(/^[A-Z]\)\s*/, "")}
  </div>
))}
    </div>

    <div style={{ textAlign: "center" }}>
  <h4>Match</h4>

      {question.left.map((item) => (
        <select
          key={item}
          value={matchAnswers[item] || ""}
          onChange={(e) =>
            setMatchAnswers({
              ...matchAnswers,
              [item]: e.target.value
            })
          }
          style={{
  width: "100%",
  marginBottom: "20px",
  padding: "10px",
  background: "#0F172A",
  color: "#FFFFFF",
  border: "2px solid #06B6D4",
  borderRadius: "8px",
  outline: "none",
  fontWeight: "600",
  cursor: "pointer",
  textAlign: "center"
}}
        >
          <option value="">
            Select
          </option>

          <option value="a">a</option>
          <option value="b">b</option>
          <option value="c">c</option>

        </select>
      ))}
    </div>

    <div>
      <h4>Right Side</h4>

     {question.right.map((item, index) => (
        <div
          key={item}
          
          style={{
            marginBottom: "20px"
          }}
        >
{item.replace(/^[A-Z]\)\s*/, "")}
        </div>
      ))}
    </div>

  </div>

  <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "30px"
  }}
>
  <button
  className="next-btn"
  style={{
    background:
      "linear-gradient(135deg,#06B6D4,#3B82F6)",
    border: "none",
    color: "white",
    padding: "12px 30px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 0 15px rgba(6,182,212,0.4)"
  }}
    onClick={() => {

      let correct = true;

      Object.keys(
        question.answer
      ).forEach((key) => {

        if (
          matchAnswers[key] !==
          question.answer[key]
        ) {
          correct = false;
        }

      });

      if (correct) {
        setScore((prev) => prev + 1);
      } else {
        setWeakAreas((prev) => [
          ...prev,
          question.topic
        ]);
      }

      setShowExplanation(true);

    }}
  >
    Submit Match
  </button>
</div>

</div>

)}

        {showExplanation && (
          <div className="explanation-box">
            <div className="explanation-header">
             <div>

  {question.type === "match" ? (

    <>
      <h4>Correct Matches:</h4>

      {Object.entries(question.answer).map(
  ([key, value], index) => (

    <div
      key={key}
      style={{
        fontWeight: "600",
        marginTop: "8px"
      }}
    >
      {index + 1} → {value.toUpperCase()} ✓
    </div>

  )
)}
    </>

  ) : (

    <h4>
      Correct Answer:{" "}
      {
        question.type === "fill_blank" ||
        question.type === "fill_blank_option"
          ? question.answer

          : question.type === "true_false"
          ? question.answer

          : question.options?.[
              question.answer.charCodeAt(0) - 65
            ]
      }
    </h4>

  )}

</div>

              <button
  className="next-btn"
  onClick={handleNextQuestion}
>
  {currentQuestion === questions.length - 1
    ? "✅ Submit Quiz"
    : "Next Question →"}
</button>
            </div>

            <p>{question.explanation}</p>
          </div>
        )}
      </div>

      
    </div>
  );
}

export default QuizScreen;