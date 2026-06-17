import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import ComparisonViewer from "./ComparisonViewer";
import { comparisonData } from "../../data/comparisonData";
import { FiSearch, FiRepeat } from "react-icons/fi";

function Comparison() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const organsList = Object.values(comparisonData);

  const filteredOrgans = organsList.filter((org) =>
    org.organName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectOrgan = (name) => {
    setSelectedOrgan(name);
  };

  return (
    <div className="body-select-container">
      <Navbar />

      <div className="dashboard-content" style={{ position: "relative", zIndex: 1 }}>
        {/* Background Glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: "rgba(6, 182, 212, 0.12)",
            borderRadius: "50%",
            filter: "blur(150px)",
            top: "-100px",
            right: "-100px",
            pointerEvents: "none",
            zIndex: 0
          }}
        />

        {selectedOrgan ? (
          <ComparisonViewer 
            organName={selectedOrgan} 
            onBack={() => setSelectedOrgan(null)} 
          />
        ) : (
          <>
            {/* Header Area */}
            <div style={{ textAlign: "center", marginBottom: "40px", position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                fontSize: "24px",
                color: "#06B6D4",
                marginBottom: "16px",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.15)"
              }}>
                <FiRepeat />
              </div>
              <h1 className="body-select-title" style={{ margin: "0 0 10px 0", fontWeight: "800" }}>
                Anatomical Comparison Module
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "16px", margin: "0 0 30px 0" }}>
                Compare anatomical structures across different body conditions and genders.
              </p>

              {/* Search Bar */}
              <div style={{
                position: "relative",
                maxWidth: "400px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center"
              }}>
                <FiSearch style={{
                  position: "absolute",
                  left: "16px",
                  color: "#94A3B8",
                  fontSize: "18px"
                }} />
                <input
                  type="text"
                  placeholder="Search comparison organ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 48px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(15, 23, 42, 0.6)",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#06B6D4";
                    e.target.style.boxShadow = "0 0 15px rgba(6, 182, 212, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.target.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.02)";
                  }}
                />
              </div>
            </div>

            {/* Grid Layout of Organs */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              position: "relative",
              zIndex: 1
            }}>
              {filteredOrgans.map((organ) => (
                <div
                  key={organ.organName}
                  onClick={() => handleSelectOrgan(organ.organName)}
                  style={{
                    background: "rgba(30, 41, 59, 0.45)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    padding: "30px",
                    color: "white",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 0 20px rgba(6, 182, 212, 0.15)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 0 35px rgba(6, 182, 212, 0.3)";
                    e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.15)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style={{ fontSize: "70px", marginBottom: "15px" }}>{organ.icon}</div>
                  <h2 style={{
                    color: "#06B6D4",
                    fontSize: "22px",
                    fontWeight: "700",
                    margin: "0 0 10px 0"
                  }}>
                    {organ.organName}
                  </h2>
                  <p style={{
                    color: "#CBD5E1",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    margin: 0
                  }}>
                    {organ.description}
                  </p>
                </div>
              ))}
            </div>

            {filteredOrgans.length === 0 && (
              <div style={{ textAlign: "center", color: "#94A3B8", marginTop: "40px" }}>
                <p style={{ fontSize: "16px" }}>No organs match your search criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Comparison;
