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
      } else if (heartRateType === "fast") {
        const t = (elapsed * 2.2) % 2.0;
        if (t < 0.2) {
          offset = Math.sin((t / 0.2) * Math.PI) * 0.06;
        } else if (t >= 0.25 && t < 0.45) {
          offset = Math.sin(((t - 0.25) / 0.2) * Math.PI) * 0.09;
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
  const [activeTab, setActiveTab] = useState("gender"); // "gender" | "condition" | "age"
  const [leftMaximized, setLeftMaximized] = useState(false);
  const [rightMaximized, setRightMaximized] = useState(false);

  const leftControlsRef = useRef();
  const rightControlsRef = useRef();

  const data = comparisonData[organName];

  if (!data) {
    return (
      <div className="no-results">
        <h3>Organ data not found for: {organName}</h3>
        {onBack && <button onClick={onBack} className="back-btn" style={{ margin: "20px auto 0" }}>← Back</button>}
      </div>
    );
  }

  const modelPath = data.maleModel;
  const isHeart = organName === "Heart";
  const isBrain = organName === "Brain";
  const currentTab = activeTab === "gender" ? data.genderComparison : (activeTab === "condition" ? data.conditionComparison : data.ageComparison);

  // Base scales
  const baseScale = isBrain ? 1.8 : 2.2;
  const leftScale = baseScale;
  const rightScale = activeTab === "gender" ? baseScale * 0.85 : (activeTab === "age" ? baseScale * 0.65 : baseScale);

  // Independent Zoom & Reset Handlers
  const handleZoomInLeft = () => {
    if (leftControlsRef.current) {
      leftControlsRef.current.object.position.multiplyScalar(0.85);
      leftControlsRef.current.update();
    }
  };
  const handleZoomOutLeft = () => {
    if (leftControlsRef.current) {
      leftControlsRef.current.object.position.multiplyScalar(1.15);
      leftControlsRef.current.update();
    }
  };
  const handleResetLeft = () => {
    if (leftControlsRef.current) leftControlsRef.current.reset();
  };

  const handleZoomInRight = () => {
    if (rightControlsRef.current) {
      rightControlsRef.current.object.position.multiplyScalar(0.85);
      rightControlsRef.current.update();
    }
  };
  const handleZoomOutRight = () => {
    if (rightControlsRef.current) {
      rightControlsRef.current.object.position.multiplyScalar(1.15);
      rightControlsRef.current.update();
    }
  };
  const handleResetRight = () => {
    if (rightControlsRef.current) rightControlsRef.current.reset();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Viewer Header */}
      {!hideHeader && (
        <div className="viewer-header">
          {onBack ? (
            <button onClick={onBack} className="back-btn">
              <span style={{ fontSize: "18px", marginBottom: "2px" }}>←</span> Back to Organs
            </button>
          ) : <div style={{ width: "160px" }}></div>}
          
          <div className="viewer-title-center">
            <div className="viewer-organ-icon">
              {data.icon}
            </div>
            <div className="viewer-title-wrapper">
              <h2 className="viewer-title">{data.organName} Comparison</h2>
              <span className="viewer-subtitle">Interactive 3D View</span>
            </div>
          </div>

          <div style={{ width: "160px" }}></div>
        </div>
      )}

      {/* Comparison Tab Selector */}
            <div className="tab-selector">
        <button
          onClick={() => {
            setActiveTab("gender");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          className={`tab-btn ${activeTab === "gender" ? "active-gender" : ""}`}
        >
          Male vs Female
        </button>
        <button
          onClick={() => {
            setActiveTab("condition");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          className={`tab-btn ${activeTab === "condition" ? "active-condition" : ""}`}
        >
          Healthy vs Diseased
        </button>
        <button
          onClick={() => {
            setActiveTab("age");
            setLeftMaximized(false);
            setRightMaximized(false);
          }}
          className={`tab-btn ${activeTab === "age" ? "active-age" : ""}`}
        >
          Adult vs Child
        </button>
      </div>

      {/* Side-by-Side 3D Viewer Layout */}
      <div className="canvas-grid" style={{ gridTemplateColumns: leftMaximized || rightMaximized ? "1fr" : "1fr 1fr" }}>
        {/* Left Viewport */}
        {!rightMaximized && (
          <div className="viewport-card">
            <div className="viewport-toolbar">
              <span className={`viewport-badge ${activeTab === "gender" ? "badge-male" : (activeTab === "condition" ? "badge-healthy" : "badge-adult")}`}>
                {currentTab.leftTitle}
              </span>
              <div className="toolbar-controls">
                <button onClick={handleZoomInLeft} className="toolbar-btn" title="Zoom In">➕</button>
                <button onClick={handleZoomOutLeft} className="toolbar-btn" title="Zoom Out">➖</button>
                <button onClick={handleResetLeft} className="toolbar-btn" title="Reset camera">🔄 Reset</button>
                <button onClick={() => setLeftMaximized(!leftMaximized)} className="toolbar-btn" title="Toggle Maximize">
                  {leftMaximized ? "🗖 Restore" : "🗗 Maximize"}
                </button>
              </div>
            </div>
            <div className="canvas-container">
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

        {/* Right Viewport */}
        {!leftMaximized && (
          <div className="viewport-card">
            <div className="viewport-toolbar">
              <span className={`viewport-badge ${activeTab === "gender" ? "badge-female" : (activeTab === "condition" ? "badge-diseased" : "badge-child")}`}>
                {currentTab.rightTitle}
              </span>
              <div className="toolbar-controls">
                <button onClick={handleZoomInRight} className="toolbar-btn" title="Zoom In">➕</button>
                <button onClick={handleZoomOutRight} className="toolbar-btn" title="Zoom Out">➖</button>
                <button onClick={handleResetRight} className="toolbar-btn" title="Reset camera">🔄 Reset</button>
                <button onClick={() => setRightMaximized(!rightMaximized)} className="toolbar-btn" title="Toggle Maximize">
                  {rightMaximized ? "🗖 Restore" : "🗗 Maximize"}
                </button>
              </div>
            </div>
            <div className="canvas-container">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={3.5} />
                <directionalLight position={[2, 2, 2]} intensity={3.5} />
                <ComparativeModel 
                  modelPath={modelPath} 
                  organName={organName}
                  scale={rightScale}
                  animateHeartbeat={isHeart}
                  heartRateType={activeTab === "gender" ? "normal" : (activeTab === "condition" ? "arrhythmia" : "fast")}
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
      <div className="stats-grid">
        {/* Left Side Info */}
        <div className="stats-card">
          <h4 className={`stats-card-title ${activeTab === "gender" ? "stats-title-left-gender" : (activeTab === "condition" ? "stats-title-left-condition" : "stats-title-left-age")}`}>
            {currentTab.leftTitle} Specifications
          </h4>
          <table className="stats-table">
            <tbody>
              {Object.entries(currentTab.leftStats).map(([key, val]) => (
                <tr key={key}>
                  <td className="stats-label">{key.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="stats-value">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="stats-notes">{currentTab.leftNotes}</p>
        </div>

        {/* Right Side Info */}
        <div className="stats-card">
          <h4 className={`stats-card-title ${activeTab === "gender" ? "stats-title-right-gender" : (activeTab === "condition" ? "stats-title-right-condition" : "stats-title-right-age")}`}>
            {currentTab.rightTitle} Specifications
          </h4>
          <table className="stats-table">
            <tbody>
              {Object.entries(currentTab.rightStats).map(([key, val]) => (
                <tr key={key}>
                  <td className="stats-label">{key.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="stats-value">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="stats-notes">{currentTab.rightNotes}</p>
        </div>
      </div>

      {/* Comparison Summary Panel */}
      <div className="summary-panel">
        <h4 className="summary-title">📋 Key Anatomical Differences</h4>
        <ul className="summary-list">
          {currentTab.differences.map((diff, index) => (
            <li key={index}>{diff}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ComparisonViewer;
