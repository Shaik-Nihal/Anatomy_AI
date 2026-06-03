import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function BodySelection() {
  const navigate = useNavigate();

  const cardStyle = {
    width: "280px",
    height: "420px",
    borderRadius: "30px",
    background: "rgba(30,41,59,0.45)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 0 25px rgba(6,182,212,0.15)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        color: "white",
        fontFamily: "Arial",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          padding: "40px",
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
            pointerEvents: "none",
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontSize: "52px",
            color: "#F8FAFC",
            marginBottom: "15px",
            zIndex: 1,
          }}
        >
          Choose Body Type
        </h1>

        <p
          style={{
            color: "#94A3B8",
            marginBottom: "60px",
            fontSize: "18px",
            zIndex: 1,
          }}
        >
          Select a human anatomy model to begin exploration
        </p>

        {/* Cards */}
        <div
          style={{
            display: "flex",
            gap: "50px",
            zIndex: 1,
          }}
        >
          {/* Male */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(6, 182, 212, 0.15)";
            }}
            onClick={() => navigate("/organ-selection")}
          >
            <div
              style={{
                fontSize: "120px",
                marginBottom: "20px",
              }}
            >
              ♂
            </div>

            <h2
              style={{
                color: "#06B6D4",
                fontSize: "32px",
              }}
            >
              Male
            </h2>

            <p
              style={{
                color: "#CBD5E1",
                marginTop: "15px",
                textAlign: "center",
                width: "220px",
                lineHeight: "1.6",
              }}
            >
              Explore the male human anatomy in immersive 3D.
            </p>
          </div>

          {/* Female */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(6, 182, 212, 0.15)";
            }}
            onClick={() => navigate("/organ-selection")}
          >
            <div
              style={{
                fontSize: "120px",
                marginBottom: "20px",
              }}
            >
              ♀
            </div>

            <h2
              style={{
                color: "#06B6D4",
                fontSize: "32px",
              }}
            >
              Female
            </h2>

            <p
              style={{
                color: "#CBD5E1",
                marginTop: "15px",
                textAlign: "center",
                width: "220px",
                lineHeight: "1.6",
              }}
            >
              Explore the female human anatomy in immersive 3D.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BodySelection;