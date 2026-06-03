import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function OrganModel({ organ, onSelectPart }) {
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
      onClick={(e) => {
        e.stopPropagation();
        const meshName = e.object.name || "";
        let label = "Anatomical Region";
        let desc = "Interactive 3D structure. Click on specific regions to highlight them.";
        
        const nameLower = meshName.toLowerCase();
        
        if (organ === "Heart" || organ === "Human Anatomy") {
          // Heart structures mapping
          if (nameLower.includes("aorta")) {
            label = "Aorta";
            desc = "The main and largest artery in the body. It carries oxygen-rich blood away from the left ventricle of the heart to the systemic circulation.";
          } else if (nameLower.includes("left_ventricle") || nameLower.includes("lv") || (nameLower.includes("ventricle") && nameLower.includes("left"))) {
            label = "Left Ventricle";
            desc = "One of the four heart chambers. It receives oxygenated blood from the left atrium and pumps it into the aorta to feed the body tissues.";
          } else if (nameLower.includes("right_ventricle") || nameLower.includes("rv") || (nameLower.includes("ventricle") && nameLower.includes("right"))) {
            label = "Right Ventricle";
            desc = "The chamber that receives oxygen-poor blood from the right atrium and pumps it into the lungs via the pulmonary artery for oxygenation.";
          } else if (nameLower.includes("left_atrium") || nameLower.includes("la") || (nameLower.includes("atrium") && nameLower.includes("left"))) {
            label = "Left Atrium";
            desc = "The upper left chamber that receives oxygenated blood returning from the lungs through the pulmonary veins, pumping it into the left ventricle.";
          } else if (nameLower.includes("right_atrium") || nameLower.includes("ra") || (nameLower.includes("atrium") && nameLower.includes("right"))) {
            label = "Right Atrium";
            desc = "The upper right chamber that receives deoxygenated blood from the superior and inferior vena cava, pumping it into the right ventricle.";
          } else if (nameLower.includes("pulmonary") || nameLower.includes("artery")) {
            label = "Pulmonary Artery";
            desc = "The artery carrying oxygen-poor blood from the right side of the heart to the lungs for replenishment.";
          } else {
            label = "Myocardium / Heart Wall";
            desc = "The muscular wall of the heart. It consists of cardiac muscle cells that contract rhythmically to pump blood throughout the body.";
          }
        } else if (organ === "Brain") {
          // Brain structures mapping
          if (nameLower.includes("cerebellum")) {
            label = "Cerebellum";
            desc = "Located at the back of the skull. It coordinates voluntary muscle movements, posture, balance, and motor learning.";
          } else if (nameLower.includes("stem") || nameLower.includes("medulla") || nameLower.includes("pons") || nameLower.includes("spinal")) {
            label = "Brainstem";
            desc = "Connects the cerebrum to the spinal cord. It controls critical automatic vital functions like breathing, heart rate, and blood pressure.";
          } else if (nameLower.includes("frontal")) {
            label = "Frontal Lobe";
            desc = "The part of the cerebral cortex involved in reasoning, motor control, decision-making, planning, and expressive language.";
          } else if (nameLower.includes("parietal")) {
            label = "Parietal Lobe";
            desc = "Processes sensory signals such as touch, temperature, pressure, pain, and handles spatial and mathematical calculations.";
          } else if (nameLower.includes("occipital")) {
            label = "Occipital Lobe";
            desc = "The visual processing center of the mammalian brain, containing the majority of the anatomical region of the visual cortex.";
          } else if (nameLower.includes("temporal")) {
            label = "Temporal Lobe";
            desc = "Involved in primary auditory perception, memory acquisition, emotion, and language comprehension (Wernicke's area).";
          } else if (nameLower.includes("cortex") || nameLower.includes("cerebrum") || nameLower.includes("hemisphere")) {
            label = "Cerebral Cortex";
            desc = "The outer layer of the cerebrum, divided into two hemispheres. It plays a key role in cognition, awareness, and abstract thought.";
          } else {
            label = "Cerebral Hemisphere Region";
            desc = "A region of the cerebrum responsible for high-level intellectual functions, voluntary actions, and sensory decoding.";
          }
        } else {
          label = meshName.replace(/_/g, " ") || "Anatomical Structure";
          desc = `Part of the interactive 3D model representing the ${organ.toLowerCase()} system. Click on parts to highlight them.`;
        }
        
        onSelectPart({ label, desc, point: e.point });
      }}
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

  // Selection states for clicked model component
  const [selectedPart, setSelectedPart] = useState(null);

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
            3D Canvas Controls
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
              alert(showLabels ? "Labels hidden" : "Interactive click labels mode active. Click any part of the 3D model!");
            }}
          >
            🏷️ Labels Mode
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
              fontSize: "30px",
              marginTop: "20px",
              fontWeight: "700",
            }}
          >
            {selectedPart ? selectedPart.label : selectedOrgan}
          </h2>

          <p
            style={{
              color: "#CBD5E1",
              lineHeight: "1.8",
              marginTop: "16px",
              fontSize: "14px",
            }}
          >
            {selectedPart ? selectedPart.desc : `Explore detailed anatomy of the ${selectedOrgan.toLowerCase()} in interactive 3D and augmented reality. Click on different parts of the 3D model to see local labels and detailed physiological descriptions.`}
          </p>

          {selectedPart && (
            <button
              onClick={() => setSelectedPart(null)}
              style={{
                marginTop: "15px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8",
                fontSize: "12px",
                cursor: "pointer",
                alignSelf: "flex-start",
                transition: "0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "white"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94A3B8"}
            >
              🔄 Reset to {selectedOrgan}
            </button>
          )}

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

            <OrganModel 
              organ={selectedOrgan} 
              onSelectPart={(part) => setSelectedPart(part)}
            />

            {/* Glowing pinpoint and floating text label */}
            {selectedPart && selectedPart.point && (
              <mesh position={selectedPart.point}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="#06B6D4" toneMapped={false} />
                <Html distanceFactor={6} center>
                  <div style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "2px solid #06B6D4",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    fontFamily: "sans-serif",
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 15px rgba(6,182,212,0.6)",
                    pointerEvents: "none",
                  }}>
                    {selectedPart.label}
                  </div>
                </Html>
              </mesh>
            )}

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