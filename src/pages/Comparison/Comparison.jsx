import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import ComparisonViewer from "./ComparisonViewer";
import { comparisonData } from "../../data/comparisonData";
import { FiSearch, FiRepeat } from "react-icons/fi";
import "./Comparison.css";

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
    <div className="comparison-page-container">
      <Navbar />

      <div className="comparison-content">
        {selectedOrgan ? (
          <ComparisonViewer 
            organName={selectedOrgan} 
            onBack={() => setSelectedOrgan(null)} 
          />
        ) : (
          <>
            {/* Header Area */}
            <div className="comparison-header">
              <div className="header-badge">
                <FiRepeat /> Module
              </div>
              <h1 className="comparison-title">
                Anatomical Comparison
              </h1>
              <p className="comparison-subtitle">
                Compare anatomical structures across different body conditions and genders using interactive 3D models.
              </p>

              {/* Search Bar */}
              <div className="search-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search comparison organ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Grid Layout of Organs */}
            <div className="organ-grid">
              {filteredOrgans.map((organ) => (
                <div
                  key={organ.organName}
                  onClick={() => handleSelectOrgan(organ.organName)}
                  className="organ-card"
                >
                  <div className="organ-card-header">
                    <div className="organ-icon-container">
                      {organ.icon.endsWith(".png") ? (
                        <img 
                          src={organ.icon} 
                          alt={organ.organName} 
                          style={{ width: "40px", height: "40px", objectFit: "contain" }} 
                        />
                      ) : (
                        <span className="organ-icon">{organ.icon}</span>
                      )}
                    </div>
                    <h2 className="organ-name">{organ.organName}</h2>
                  </div>
                  <p className="organ-desc">{organ.description}</p>
                  <div className="organ-action-btn">
                    Compare Module <span className="arrow">→</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrgans.length === 0 && (
              <div className="no-results">
                <p>No organs match your search criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Comparison;

