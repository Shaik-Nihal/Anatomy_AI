import React, { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { comparisonData } from "../../data/comparisonData";

// 3D Model Component supporting scaling, beating animations, and pathological tints
function ComparativeModel({ 
  modelPath, 
  organName, 
  scale, 
  animateHeartbeat, 
  heartRateType, // "normal" | "arrhythmia" | "none"
  isDiseased, 
  highlightRegion 
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();

  // Clone materials to prevent cross-canvas visual side-effects
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material = node.material.clone();
      }
    });
    return clone;
  }, [scene]);

  // Apply visual styling for diseased state
  useEffect(() => {
    if (isDiseased && clonedScene) {
      clonedScene.traverse((node) => {
        if (node.isMesh && node.material) {
          // Darken and shift towards an unhealthy greenish/yellowish/gray tone
          if (node.material.color) {
            node.material.color.multiplyScalar(0.6).add(new THREE.Color(0.08, 0.12, 0.05));
          }
          if (node.material.emissive) {
            const nameLower = node.name.toLowerCase();
            if (nameLower.includes("myocardium") || nameLower.includes("ventricle") || nameLower.includes("cortex") || nameLower.includes("temporal")) {
              node.material.emissive.setHex(0x3f1a05); // necrotic brown
              node.material.emissiveIntensity = 0.3;
            }
          }
        }
      });
    }
  }, [clonedScene, isDiseased]);

  // Beating or pulsing scale animation using useFrame
  useFrame((state) => {
    if (!modelRef.current) return;

    if (animateHeartbeat && organName === "Heart") {
      const elapsed = state.clock.getElapsedTime();
      let offset = 0;

      if (heartRateType === "normal") {
        // Double pump sinus beat (lub-dub)
        const t = (elapsed * 1.4) % 2.0;
        if (t < 0.25) {
          offset = Math.sin((t / 0.25) * Math.PI) * 0.06; // Lub
        } else if (t >= 0.3 && t < 0.55) {
          offset = Math.sin(((t - 0.3) / 0.25) * Math.PI) * 0.09; // Dub
        }
      } else if (heartRateType === "arrhythmia") {
        // Irregular beats
        const t = (elapsed * 2.2) % 2.5;
        if (t < 0.15) {
          offset = Math.sin((t / 0.15) * Math.PI) * 0.05;
        } else if (t >= 0.2 && t < 0.35) {
          offset = Math.sin(((t - 0.2) / 0.15) * Math.PI) * 0.08;
        } else if (t >= 0.8 && t < 0.95) {
          offset = Math.sin(((t - 0.8) / 0.15) * Math.PI) * 0.04; // ectopic beat
        }
      }

      const finalScale = scale * (1 + offset);
      modelRef.current.scale.set(finalScale, finalScale, finalScale);
    } else {
      modelRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={clonedScene} position={[0, -0.6, 0]} />
      {isDiseased && highlightRegion && (
        <mesh position={organName === "Brain" ? [0.6, 0, 0.4] : [0, -0.4, 0.3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function ComparisonViewer({ organName, onBack, hideHeader = false }) {
  const [activeTab, setActiveTab] = useState("gender"); // "gender" | "condition"
  const [leftMaximized, setLeftMaximized] = useState(false);
  const [rightMaximized, setRightMaximized] = useState(false);

  const leftControlsRef = useRef();
  const rightControlsRef = useRef();

  const data = comparisonData[organName];

  if (!data) {
    return (
      <div style={{ padding: "40px", color: "white", textAlign: "center" }}>
        <h3>Organ data not found for: {organName}</h3>
        {onBack && <button onClick={onBack} style={{ marginTop: "20px" }}>Back</button>}
      </div>
    );
  }

  const modelPath = data.maleModel;
  const isHeart = organName === "Heart";
  const isBrain = organName === "Brain";
  const currentTab = activeTab === "gender" ? data.genderComparison : data.conditionComparison;

  // Base scales
  const baseScale = isBrain ? 1.8 : 2.2;
  const leftScale = baseScale;
  const rightScale = activeTab === "gender" ? baseScale * 0.85 : baseScale;

  // Independent Zoom & Reset Handlers
  const handleZoomInLeft = () => {
    if (leftControlsRef.current) {
      const controls = leftControlsRef.current;
      controls.object.position.multiplyScalar(0.85); // 15% closer
      controls.update();
    }
  };

  const handleZoomOutLeft = () => {
    if (leftControlsRef.current) {
      const controls = leftControlsRef.current;
      controls.object.position.multiplyScalar(1.15); // 15% further
      controls.update();
    }
  };

  const handleResetLeft = () => {
    if (leftControlsRef.current) {
      leftControlsRef.current.reset();
    }
  };

  const handleZoomInRight = () => {
    if (rightControlsRef.current) {
      const controls = rightControlsRef.current;
      controls.object.position.multiplyScalar(0.85);
      controls.update();
    }
  };

  const handleZoomOutRight = () => {
    if (rightControlsRef.current) {
      const controls = rightControlsRef.current;
      controls.object.position.multiplyScalar(1.15);
      controls.update();
    }
  };

  const handleResetRight = () => {
    if (rightControlsRef.current) {
      rightControlsRef.current.reset();
    }
  };

  const controlBtnStyle = {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    padding: "6px 12px",
    color: "#E2E8F0",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Viewer Header */}
      {!hideHeader && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.color = "white"}
                onMouseLeave={(e) => e.target.style.color = "#94A3B8"}
              >
                ← Back
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: "24px", color: "#FFF" }}>
              {data.icon} {data.organName} Comparison View
            </h2>
          </div>
        </div>
      )}

      {/* Comparison Tab Selector */}
      <div style={{
        display: "flex",
        background: "rgba(10, 15, 30, 0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        padding: "4px",
        gap: "4px",
        alignSelf: "center",
        marginBottom: "20px",
        zIndex: 5
      }}>
        <button
          onClick={() => {
            setActiveTab("gender");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          style={{
            background: activeTab === "gender" ? "rgba(6, 182, 212, 0.15)" : "transparent",
            border: activeTab === "gender" ? "1px solid rgba(6, 182, 212, 0.3)" : "1px solid transparent",
            color: activeTab === "gender" ? "#06B6D4" : "#94A3B8",
            padding: "8px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            transition: "all 0.3s"
          }}
        >
          Male vs Female
        </button>
        <button
          onClick={() => {
            setActiveTab("condition");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          style={{
            background: activeTab === "condition" ? "rgba(239, 68, 68, 0.12)" : "transparent",
            border: activeTab === "condition" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid transparent",
            color: activeTab === "condition" ? "#EF4444" : "#94A3B8",
            padding: "8px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            transition: "all 0.3s"
          }}
        >
          Healthy vs Diseased
        </button>
      </div>

      {/* Side-by-Side 3D Viewer Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: leftMaximized || rightMaximized ? "1fr" : "1fr 1fr",
        gap: "20px",
        flex: 1,
        minHeight: "400px",
        marginBottom: "20px"
      }}>
        {/* Left Viewport (Male / Healthy) */}
        {!rightMaximized && (
          <div style={{
            position: "relative",
            background: "rgba(15, 23, 42, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Control Toolbar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(10, 15, 30, 0.6)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "10px 16px",
              zIndex: 6
            }}>
              <span style={{
                background: activeTab === "gender" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.15)",
                border: activeTab === "gender" ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(16, 185, 129, 0.3)",
                color: activeTab === "gender" ? "#60A5FA" : "#34D399",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700"
              }}>{currentTab.leftTitle}</span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={handleZoomInLeft} style={controlBtnStyle} title="Zoom In">➕</button>
                <button onClick={handleZoomOutLeft} style={controlBtnStyle} title="Zoom Out">➖</button>
                <button onClick={handleResetLeft} style={controlBtnStyle} title="Reset camera position">🔄 Reset</button>
                <button onClick={() => setLeftMaximized(!leftMaximized)} style={controlBtnStyle} title="Toggle Maximize">
                  {leftMaximized ? "🗖 Restore" : "🗗 Maximize"}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: "relative" }}>
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={3.5} />
                <directionalLight position={[2, 2, 2]} intensity={3.5} />
                <ComparativeModel 
                  modelPath={modelPath} 
                  organName={organName}
                  scale={leftScale}
                  animateHeartbeat={isHeart}
                  heartRateType="normal"
                  isDiseased={false}
                />
                <OrbitControls ref={leftControlsRef} />
              </Canvas>
            </div>
          </div>
        )}

        {/* Right Viewport (Female / Diseased) */}
        {!leftMaximized && (
          <div style={{
            position: "relative",
            background: "rgba(15, 23, 42, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Control Toolbar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(10, 15, 30, 0.6)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "10px 16px",
              zIndex: 6
            }}>
              <span style={{
                background: activeTab === "gender" ? "rgba(244, 114, 182, 0.2)" : "rgba(239, 68, 68, 0.15)",
                border: activeTab === "gender" ? "1px solid rgba(244, 114, 182, 0.4)" : "1px solid rgba(239, 68, 68, 0.3)",
                color: activeTab === "gender" ? "#F472B6" : "#F87171",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700"
              }}>{currentTab.rightTitle}</span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={handleZoomInRight} style={controlBtnStyle} title="Zoom In">➕</button>
                <button onClick={handleZoomOutRight} style={controlBtnStyle} title="Zoom Out">➖</button>
                <button onClick={handleResetRight} style={controlBtnStyle} title="Reset camera position">🔄 Reset</button>
                <button onClick={() => setRightMaximized(!rightMaximized)} style={controlBtnStyle} title="Toggle Maximize">
                  {rightMaximized ? "🗖 Restore" : "🗗 Maximize"}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: "relative" }}>
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={3.5} />
                <directionalLight position={[2, 2, 2]} intensity={3.5} />
                <ComparativeModel 
                  modelPath={modelPath} 
                  organName={organName}
                  scale={rightScale}
                  animateHeartbeat={isHeart}
                  heartRateType={activeTab === "gender" ? "normal" : "arrhythmia"}
                  isDiseased={activeTab === "condition"}
                  highlightRegion={activeTab === "condition"}
                />
                <OrbitControls ref={rightControlsRef} />
              </Canvas>
            </div>
          </div>
        )}
      </div>

      {/* Comparative Notes & Statistics Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "20px"
      }}>
        {/* Left Side Info */}
        <div className="glass-card-new" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: activeTab === "gender" ? "#60A5FA" : "#34D399", fontSize: "16px", fontWeight: "700" }}>
            {currentTab.leftTitle} Specifications
          </h4>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "16px" }}>
            <tbody>
              {Object.entries(currentTab.leftStats).map(([key, val]) => (
                <tr key={key} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "8px 0", color: "#94A3B8", textTransform: "capitalize", fontWeight: "600" }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td style={{ padding: "8px 0", color: "white", textAlign: "right", fontWeight: "700" }}>
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
            {currentTab.leftNotes}
          </p>
        </div>

        {/* Right Side Info */}
        <div className="glass-card-new" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: activeTab === "gender" ? "#F472B6" : "#F87171", fontSize: "16px", fontWeight: "700" }}>
            {currentTab.rightTitle} Specifications
          </h4>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "16px" }}>
            <tbody>
              {Object.entries(currentTab.rightStats).map(([key, val]) => (
                <tr key={key} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "8px 0", color: "#94A3B8", textTransform: "capitalize", fontWeight: "600" }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td style={{ padding: "8px 0", color: "white", textAlign: "right", fontWeight: "700" }}>
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
            {currentTab.rightNotes}
          </p>
        </div>
      </div>

      {/* Comparison Summary Panel */}
      <div className="glass-card-new" style={{ padding: "24px" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#06B6D4", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          📋 Key Anatomical Differences
        </h4>
        <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentTab.differences.map((diff, index) => (
            <li key={index} style={{ color: "#E2E8F0", fontSize: "14px", lineHeight: "1.6" }}>
              {diff}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ComparisonViewer;
