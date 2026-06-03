import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

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
      icon: "🩸",
      description: "Explore digestive organ structures.",
    },
    {
      name: "Human Anatomy",
      icon: "🧍",
      description: "Explore the complete human body and all organ systems in 3D.",
    },
    {
      name: "Kidney",
      icon: "🫘",
      description: "Learn excretory system anatomy in 3D.",
    },
    {
      name: "Eye",
      icon: "👁️",
      description: "Understand visual system anatomy.",
    },
    {
      name: "Stomach",
      icon: "🍽️",
      description: "Explore digestive functions and anatomy.",
    },
    {
      name: "Skeleton",
      icon: "🦴",
      description: "Study the complete skeletal system.",
    },
  ];

  const organStyle = {
    background: "rgba(30,41,59,0.45)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)",
    borderRadius: "25px",
    padding: "30px",
    color: "white",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 0 20px rgba(6,182,212,0.15)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        color: "white",
        fontFamily: "Arial",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div
        style={{
          padding: "40px",
          position: "relative",
          zIndex: 1,
          flex: 1,
        }}
      >
        {/* Background Glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: "rgba(6,182,212,0.12)",
            borderRadius: "50%",
            filter: "blur(150px)",
            top: "-100px",
            right: "-100px",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              marginBottom: "15px",
            }}
          >
            Select Organ
          </h1>

          <p
            style={{
              color: "#94A3B8",
              fontSize: "18px",
            }}
          >
            Choose an organ to explore in immersive 3D & AR
          </p>
        </div>

        {/* Organ Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {organs.map((organ) => (
            <div
              key={organ.name}
              style={organStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 0 35px rgba(6,182,212,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px) scale(1)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(6,182,212,0.15)";
              }}
              onClick={() =>
                navigate("/ar-viewer", {
                  state: {
                    organ: organ.name,
                  },
                })
              }
            >
              <div style={{ fontSize: "80px" }}>{organ.icon}</div>

              <h2
                style={{
                  color: "#06B6D4",
                  marginTop: "15px",
                }}
              >
                {organ.name}
              </h2>

              <p
                style={{
                  color: "#CBD5E1",
                  marginTop: "10px",
                }}
              >
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