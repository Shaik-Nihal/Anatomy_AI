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
      <div className="min-h-screen p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-[42px] font-bold">🧬 Interactive Anatomy Quiz</h1>
            <p className="text-slate-300 mt-2">
              Test your medical knowledge through adaptive learning
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Search Organ..."
            className="w-full md:w-[280px] p-3.5 rounded-xl border border-cyan-500 bg-slate-800 text-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start justify-center mt-4 md:-mt-8">
          <div
            className={`flex-1 flex justify-center body-panel ${
              selectedOrgan ? selectedOrgan.toLowerCase() : ""
            }`}
          >
            <img
              src="/human-body.png"
              alt="Human Body"
              className="h-[260px] sm:h-[320px] md:h-[600px] object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            />
          </div>

          <div className="w-full md:w-[300px] grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-3 md:gap-3.5">
            {visibleOrgans.map((organ) => (
              <div
                key={organ.name}
                className={`organ-card bg-slate-800 border border-white/10 p-3 md:p-4 rounded-[16px] md:rounded-[18px] flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]
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
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{organ.icon}</span>
                )}
                <span className="font-semibold">{organ.name}</span>
              </div>
            ))}
            {!showAll && (
              <button className="col-span-2 sm:col-span-3 md:col-span-1 bg-slate-800 text-cyan-500 border-none p-3 md:p-4 rounded-[16px] md:rounded-[18px] cursor-pointer font-semibold hover:bg-slate-700 transition-colors" onClick={() => setShowAll(true)}>
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