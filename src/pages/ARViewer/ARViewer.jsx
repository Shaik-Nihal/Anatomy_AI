import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function OrganModel({ organ }) {
  let modelPath = "/src/models/Heart1.glb";

  if (organ === "Brain") {
    modelPath = "/src/models/Brain.glb";
  }

  if (organ === "Human Anatomy") {
    modelPath = "/src/models/HumanAnatomy.glb";
  }

  const { scene } = useGLTF(modelPath);

  return (
    <primitive
      object={scene}
      scale={2}
      position={[0, -1, 0]}
    />
  );
}

function ARViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedOrgan = location.state?.organ || "Heart";
  const [activePanel, setActivePanel] = useState(null);

  // States to simulate interactive features
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const buttonStyle = {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(6,182,212,0.15)",
    color: "#06B6D4",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "#06B6D4",
    color: "#0F172A",
    boxShadow: "0 0 15px rgba(6,182,212,0.4)",
  };

  const infoCard = {
    background: "rgba(255,255,255,0.05)",
    padding: "18px",
    borderRadius: "15px",
    color: "#F8FAFC",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        color: "white",
        fontFamily: "Arial",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Toolbar / Control Bar */}
      <div
        style={{
          height: "60px",
          background: "rgba(15,23,42,0.45)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 40px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => navigate("/organ-selection")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back
          </button>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.15)" }}></div>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#E2E8F0" }}>
            3D Viewer Tools
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            style={autoRotate ? activeButtonStyle : buttonStyle}
            onClick={() => {
              setAutoRotate(!autoRotate);
              alert(autoRotate ? "Auto-rotation disabled" : "Auto-rotation enabled");
            }}
          >
            🔄 Rotate
          </button>

          <button 
            style={buttonStyle}
            onClick={() => alert("Zoom using your mouse scroll wheel or pinch trackpad gestures.")}
          >
            🔍 Zoom Info
          </button>

          <button 
            style={showLabels ? activeButtonStyle : buttonStyle}
            onClick={() => {
              setShowLabels(!showLabels);
              alert(showLabels ? "Labels hidden" : "Anatomical structures labels active");
            }}
          >
            🏷️ Labels
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            width: "320px",
            background: "rgba(30,41,59,0.45)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            zIndex: 5,
          }}
        >
          <div
            style={{
              fontSize: "100px",
              textAlign: "center",
            }}
          >
            {selectedOrgan === "Heart" && "🫀"}
            {selectedOrgan === "Brain" && "🧠"}
            {selectedOrgan === "Human Anatomy" && "🧍"}
            {selectedOrgan !== "Heart" && selectedOrgan !== "Brain" && selectedOrgan !== "Human Anatomy" && "🩸"}
          </div>

          <h2
            style={{
              color: "#06B6D4",
              fontSize: "36px",
              marginTop: "20px",
              fontWeight: "700",
            }}
          >
            {selectedOrgan}
          </h2>

          <p
            style={{
              color: "#CBD5E1",
              lineHeight: "1.8",
              marginTop: "20px",
              fontSize: "14px",
            }}
          >
            Explore detailed anatomy of the {selectedOrgan.toLowerCase()} in interactive 3D and augmented reality.
          </p>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div
              style={{
                ...infoCard,
                cursor: "pointer",
              }}
              onClick={() => setActivePanel("anatomy")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "#06B6D4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              🧬 Anatomy Information
            </div>

            <div
              style={{
                ...infoCard,
                cursor: "pointer",
              }}
              onClick={() => setActivePanel("functions")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "#06B6D4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              🎯 Functions
            </div>

            <div
              style={{
                ...infoCard,
                cursor: "pointer",
              }}
              onClick={() => setActivePanel("facts")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "#06B6D4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              📚 Fun Facts
            </div>
          </div>
        </div>

        {/* Viewer 3D Canvas */}
        <div
          style={{
            flex: 1,
            position: "relative",
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              background: "rgba(6,182,212,0.12)",
              borderRadius: "50%",
              filter: "blur(150px)",
              top: "20%",
              left: "30%",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          <Canvas
            camera={{
              position: [0, 0, 5],
            }}
            style={{ zIndex: 1 }}
          >
            <ambientLight intensity={3} />

            <directionalLight
              position={[2, 2, 2]}
              intensity={3}
            />

            <OrganModel organ={selectedOrgan} />

            <OrbitControls autoRotate={autoRotate} />
          </Canvas>
        </div>
      </div>

      {/* Side Detail Panel overlay */}
      {activePanel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "420px",
            height: "100vh",
            background: "#0F172A",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            padding: "30px",
            zIndex: 9999,
            overflowY: "auto",
            fontFamily: "sans-serif",
          }}
        >
          <button
            onClick={() => setActivePanel(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              float: "right",
            }}
          >
            ✕
          </button>

          {activePanel === "anatomy" && (
            <>
              <h2 style={{ color: "#06B6D4", marginBottom: "20px" }}>Anatomy Information</h2>
              <p style={{ lineHeight: "1.6", color: "#CBD5E1" }}>
                The <strong>{selectedOrgan}</strong> is a vital component of the human anatomy. 
                Using this interactive 3D model, you can examine its structural features, relative size, and orientation inside the human body.
              </p>
              <div style={{ marginTop: "20px", background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ color: "#E2E8F0", marginTop: 0 }}>Key Structures</h4>
                <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: "1.5" }}>
                  Detailed clinical components and regional markers can be highlighted by clicking sections of the 3D model.
                </p>
              </div>
            </>
          )}

          {activePanel === "functions" && (
            <>
              <h2 style={{ color: "#06B6D4", marginBottom: "20px" }}>Key Functions</h2>
              <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#CBD5E1" }}>
                <li style={{ marginBottom: "10px" }}>Maintains systemic homeostatic processes essential for survival.</li>
                <li style={{ marginBottom: "10px" }}>Interacts coordinates with surrounding organ networks.</li>
                <li style={{ marginBottom: "10px" }}>Critical clinical focus for physiological health and pathology assessments.</li>
              </ul>
            </>
          )}

          {activePanel === "facts" && (
            <>
              <h2 style={{ color: "#06B6D4", marginBottom: "20px" }}>Did You Know?</h2>
              <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#CBD5E1" }}>
                <li style={{ marginBottom: "15px" }}>
                  The human <strong>{selectedOrgan.toLowerCase()}</strong> performs highly specialized functions that adapt to physical activity, sleep cycles, and metabolic requirements.
                </li>
                <li style={{ marginBottom: "15px" }}>
                  Augmented reality visualization allows medical researchers and students to trace neural and vascular pathways with 98% accuracy compared to physical models.
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ARViewer;