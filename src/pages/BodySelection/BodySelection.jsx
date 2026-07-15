import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./BodySelection.css";

function BodySelection() {
  const navigate = useNavigate();

  return (
    <div className="body-select-container">
      <Navbar />

      <div className="body-select-content">
        {/* Background Glow */}
        <div className="body-select-glow" />

        {/* Title */}
        <h1 className="body-select-title">
          Choose Body Type
        </h1>

        <p className="body-select-subtitle">
          Select a human anatomy model to begin exploration
        </p>

        {/* Cards */}
        <div className="body-select-grid">
          {/* Male */}
          <div
            className="body-card group"
            onClick={() => navigate("/organ-selection")}
          >
            <div className="body-card-icon">♂</div>
            <h2 className="body-card-title">Male</h2>
            <p className="body-card-desc">
              Explore the male human anatomy in immersive 3D.
            </p>
          </div>

          {/* Female */}
          <div
            className="body-card group"
            onClick={() => navigate("/organ-selection")}
          >
            <div className="body-card-icon">♀</div>
            <h2 className="body-card-title">Female</h2>
            <p className="body-card-desc">
              Explore the female human anatomy in immersive 3D.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BodySelection;