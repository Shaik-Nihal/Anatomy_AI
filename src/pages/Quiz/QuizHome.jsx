import React, { useState } from "react";
import DifficultyModal from "./components/DifficultyModal";

function QuizHome({ onStartQuiz }) {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const organs = [
    { name: "Brain", icon: "🧠" },
    { name: "Heart", icon: "🫀" },
    { name: "Lungs", icon: "🫁" },
    {
      name: "Liver",
      image: "/icons/liver.png",
    },
    { name: "Kidney", image: "/icons/kidney.png" },
    { name: "Eye", icon: "👁️" },
    { name: "Ear", icon: "👂" },
    { name: "Stomach", image: "/icons/stomach.png" },
    { name: "Bones", icon: "🦴" },
    { name: "Muscles", icon: "💪" },
    {
      name: "Intestines",
      image: "/icons/intestines.png",
    },
  ];
  const filteredOrgans = organs.filter((organ) =>
    organ.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleOrgans = searchTerm
    ? filteredOrgans
    : showAll
    ? organs
    : organs.slice(0, 5);

  return (
    <>
      <div className="quiz-home">
        <div className="top-section">
          <div className="title-section">
            <h1>🧬 Interactive Anatomy Quiz</h1>
            <p className="subtitle">
              Test your medical knowledge through adaptive learning
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Search Organ..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="main-layout">
          <div
            className={`body-panel ${
              selectedOrgan ? selectedOrgan.toLowerCase() : ""
            }`}
          >
            <img
              src="/human-body.png"
              alt="Human Body"
              className="human-body"
            />
          </div>

          <div className="organ-panel">
            {visibleOrgans.map((organ) => (
              <div
                key={organ.name}
                className={`organ-card
                  ${
                    searchTerm &&
                    organ.name.toLowerCase().includes(searchTerm.toLowerCase())
                      ? "highlight-organ"
                      : ""
                  }
                  ${selectedOrgan === organ.name ? "active-organ" : ""}
                `}
                onClick={() => setSelectedOrgan(organ.name)}
              >
                {organ.image ? (
                  <img
                    src={organ.image}
                    alt={organ.name}
                    className="organ-icon"
                  />
                ) : (
                  <span className="organ-icon">{organ.icon}</span>
                )}
                <span>{organ.name}</span>
              </div>
            ))}
            {!showAll && (
              <button className="more-btn" onClick={() => setShowAll(true)}>
                + More Organs
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedOrgan && (
        <DifficultyModal
          organ={selectedOrgan}
          onClose={() => setSelectedOrgan(null)}
          onStartQuiz={onStartQuiz}
        />
      )}
    </>
  );
}

export default QuizHome;