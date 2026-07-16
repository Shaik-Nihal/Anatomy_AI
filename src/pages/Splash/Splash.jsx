import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

function Splash() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        background:
          "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        color: "white",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Arial",
      }}
    >
      {/* Top Glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(6,182,212,0.15)",
          borderRadius: "50%",
          filter: "blur(150px)",
          top: "-100px",
        }}
      />

      {/* Bottom Glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(37,99,235,0.12)",
          borderRadius: "50%",
          filter: "blur(150px)",
          bottom: "-150px",
        }}
      />

      {/* Logo */}
      <div
        style={{
          zIndex: 1,
          marginBottom: "30px",
        }}
      >
        <img
          src={logo}
          alt="AR AnatomyAI Logo"
          style={{
            width: "380px",
            height: "380px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 30px rgba(6,182,212,0.6))",
          }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "72px",
          color: "#F8FAFC",
          marginBottom: "15px",
          zIndex: 1,
          letterSpacing: "2px",
          textShadow: "0 0 20px rgba(6,182,212,0.4)",
        }}
      >
        AR AnatomyAI
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "22px",
          color: "#CBD5E1",
          marginBottom: "45px",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "700px",
          lineHeight: "1.7",
        }}
      >
        Intelligent Augmented Reality Medical Learning Platform
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/login")}
        style={{
          padding: "18px 45px",
          background:
            "linear-gradient(to right, #06B6D4, #2563EB)",
          border: "none",
          borderRadius: "16px",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 0 30px rgba(6,182,212,0.5)",
          transition: "0.3s",
          zIndex: 1,
        }}
      >
        Launch Experience
      </button>

      {/* Footer */}
      <p
        style={{
          position: "absolute",
          bottom: "30px",
          color: "#64748B",
          fontSize: "14px",
          letterSpacing: "1px",
        }}
      >
        Powered by AI • AR • 3D Visualization
      </p>
    </div>
  );
}

export default Splash;