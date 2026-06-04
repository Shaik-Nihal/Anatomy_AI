import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  const cardStyle = {
    background: "rgba(30, 41, 59, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    borderRadius: "22px",
    padding: "30px",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 0 20px rgba(6, 182, 212, 0.12)",
    minHeight: "140px",
  };

  const disabledCardStyle = {
    ...cardStyle,
    opacity: 0.6,
    cursor: "not-allowed",
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: "rgba(6, 182, 212, 0.10)",
            borderRadius: "50%",
            filter: "blur(150px)",
            top: "-100px",
            right: "-100px",
            pointerEvents: "none",
          }}
        />

        {/* Hero Section */}
        <div className="dashboard-hero">
          <h2 className="dashboard-hero-title">
            Explore Human Anatomy in 3D & AR
          </h2>

          <p
            style={{
              color: "#CBD5E1",
              fontSize: "18px",
              maxWidth: "900px",
              lineHeight: "1.8",
            }}
          >
            Interact with realistic human organs using artificial intelligence, augmented reality, and immersive 3D learning. Access interactive quizzes to test your knowledge and track your learning progress over time.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="dashboard-grid">
          {/* Learn Anatomy */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.12)";
            }}
            onClick={() => navigate("/body-selection")}
          >
            <div style={{ fontSize: "36px" }}>🫀</div>

            <h2
              style={{
                color: "#06B6D4",
                marginTop: "18px",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Learn Anatomy
            </h2>

            <p
              style={{
                color: "#CBD5E1",
                marginTop: "14px",
                lineHeight: "1.5",
                fontSize: "15px",
              }}
            >
              Explore realistic organs in 3D & AR.
            </p>
          </div>

          {/* Quiz */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.12)";
            }}
            onClick={() => navigate("/quiz")}
          >
            <div style={{ fontSize: "36px" }}>🧠</div>

            <h2
              style={{
                color: "#06B6D4",
                marginTop: "18px",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Interactive Quiz
            </h2>

            <p
              style={{
                color: "#CBD5E1",
                marginTop: "14px",
                lineHeight: "1.5",
                fontSize: "15px",
              }}
            >
              Test your medical knowledge through AI-powered quizzes.
            </p>
          </div>

          {/* Progress Tracking */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.12)";
            }}
            onClick={() => navigate("/learning-progress")}
          >
            <div style={{ fontSize: "36px" }}>📈</div>

            <h2
              style={{
                color: "#06B6D4",
                marginTop: "18px",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Progress Tracking
            </h2>

            <p
              style={{
                color: "#CBD5E1",
                marginTop: "14px",
                lineHeight: "1.5",
                fontSize: "15px",
              }}
            >
              Track learning performance and topic mastery.
            </p>
          </div>

          {/* AI Tutor */}
          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.12)";
            }}
            onClick={() => navigate("/ai-tutor")}
          >
            <div style={{ fontSize: "36px" }}>🤖</div>

            <h2
              style={{
                color: "#06B6D4",
                marginTop: "18px",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              AI Tutor
            </h2>

            <p
              style={{
                color: "#CBD5E1",
                marginTop: "14px",
                lineHeight: "1.5",
                fontSize: "15px",
              }}
            >
              AI-powered medical explanations.
            </p>
          </div>

          {/* Organ Recognition */}
          <div
            style={disabledCardStyle}
            onClick={() => alert("Organ Recognition feature is coming soon!")}
          >
            <div style={{ fontSize: "36px" }}>📸</div>

            <h2
              style={{
                color: "#94A3B8",
                marginTop: "18px",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Organ Recognition <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "8px", marginLeft: "8px" }}>Coming Soon</span>
            </h2>

            <p
              style={{
                color: "#94A3B8",
                marginTop: "14px",
                lineHeight: "1.5",
                fontSize: "15px",
              }}
            >
              Detect organs using AI camera analysis.
            </p>
          </div>

          {/* Settings */}
          <div
            style={disabledCardStyle}
            onClick={() => alert("Settings configuration is coming soon!")}
          >
            <div style={{ fontSize: "36px" }}>⚙</div>

            <h2
              style={{
                color: "#94A3B8",
                marginTop: "18px",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Settings <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "8px", marginLeft: "8px" }}>Coming Soon</span>
            </h2>

            <p
              style={{
                color: "#94A3B8",
                marginTop: "14px",
                lineHeight: "1.5",
                fontSize: "15px",
              }}
            >
              Customize learning experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;