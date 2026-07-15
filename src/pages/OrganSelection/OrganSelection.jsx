import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./OrganSelection.css";

function OrganSelection() {
  const navigate = useNavigate();

  const organs = [
    {
      name: "Heart",
      icon: "🫀",
      description: "Explore cardiovascular anatomy in 3D.",
    },
    {
      name: "Brain",
      icon: "🧠",
      description: "Study neural structures interactively.",
    },
    {
      name: "Lungs",
      icon: "🫁",
      description: "Visualize respiratory system anatomy.",
    },
    {
      name: "Liver",
      icon: "/icons/liver.png",
      description: "Explore digestive organ structures.",
    },
    {
      name: "Human Anatomy",
      icon: "/icons/human.png",
      description: "Explore the complete human body and all organ systems in 3D.",
    },
    {
      name: "Kidney",
      icon: "/icons/kidney.png",
      description: "Learn excretory system anatomy in 3D.",
    },
    {
      name: "Eye",
      icon: "👁️",
      description: "Understand visual system anatomy.",
    },
    {
      name: "Stomach",
      icon: "/icons/stomach.png",
      description: "Explore digestive functions and anatomy.",
    },
    {
      name: "Skeleton",
      icon: "🦴",
      description: "Study the complete skeletal system.",
    },
    {
      name: "Skull",
      icon: "💀",
      description: "Examine the detailed structure of the human skull.",
    },
    {
      name: "Intestines",
      icon: "/icons/intestines.png",
      description: "Explore the small and large intestines.",
    },
  ];

  return (
    <div className="organ-select-container">
      <Navbar />

      <div className="organ-select-content">
        {/* Background Glow */}
        <div className="organ-select-glow" />

        {/* Header */}
        <div className="organ-select-header">
          <h1 className="organ-select-title">
            Select Organ
          </h1>

          <p className="organ-select-subtitle">
            Choose an organ to explore in immersive 3D & AR
          </p>
        </div>

        {/* Organ Cards */}
        <div className="organ-select-grid">
          {organs.map((organ) => (
            <div
              key={organ.name}
              className="organ-card group"
              onClick={() =>
                navigate("/ar-viewer", {
                  state: {
                    organ: organ.name,
                  },
                })
              }
            >
              <div className="organ-card-icon-container">
                {organ.icon.includes(".png") ? (
                  <img src={organ.icon} alt={organ.name} className="organ-card-icon group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="group-hover:scale-110 transition-transform duration-300 block">{organ.icon}</span>
                )}
              </div>

              <h2 className="organ-card-title">
                {organ.name}
              </h2>

              <p className="organ-card-desc">
                {organ.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganSelection;