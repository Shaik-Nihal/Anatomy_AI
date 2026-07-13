import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGamification } from "../contexts/GamificationContext";
import logo from "../assets/logo.png";
import { FiMenu, FiX, FiSettings } from "react-icons/fi";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { level, streak } = useGamification();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = location.pathname === "/dashboard";

  const navItems = [
    { label: "3D Anatomy", path: "/body-selection", icon: "🫀" },
    { label: "Quizzes", path: "/quiz", icon: "🧬" },
    { label: "AI Tutor", path: "/ai-tutor", icon: "🤖" },
    { label: "Progress Tracking", path: "/learning-progress", icon: "📈" },
  ];

  const linkStyle = (isActive) => ({
    color: isActive ? "#06B6D4" : "#94A3B8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "700",
    padding: "8px 14px",
    borderRadius: "10px",
    background: isActive ? "rgba(6, 182, 212, 0.1)" : "transparent",
    border: "1px solid " + (isActive ? "rgba(6, 182, 212, 0.2)" : "transparent"),
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap"
  });

  return (
    <header className="nav-header">
      <div className="nav-brand" onClick={() => navigate("/dashboard")}>
        <img
          src={logo}
          alt="AR AnatomyAI Logo"
          style={{
            width: "42px",
            height: "42px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))",
          }}
        />
        <h1 className="nav-title" style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "0.5px", margin: 0 }}>
          AR AnatomyAI
        </h1>
      </div>

      {!isDashboard && (
        <nav className={`nav-menu-container ${menuOpen ? "open" : ""}`}>
          <ul className="nav-menu-list">
            <li>
              <span
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                style={{
                  ...linkStyle(false),
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#E2E8F0";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94A3B8";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                }}
              >
                <span>←</span>
                <span>Dashboard</span>
              </span>
            </li>

            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === "/body-selection" && 
                  (location.pathname === "/organ-selection" || location.pathname === "/ar-viewer"));
              return (
                <li key={item.path} style={{ width: menuOpen ? "100%" : "auto" }}>
                  <span
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    style={linkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#E2E8F0";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#94A3B8";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 12px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: '600' }}>Lvl</span>
              <span style={{ fontSize: '15px', color: '#06B6D4', fontWeight: '800' }}>{level}</span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', title: `${streak} Day Streak!` }}>
              <span style={{ fontSize: '15px', color: streak > 0 ? '#F59E0B' : '#64748B' }}>
                {streak >= 3 ? '🔥' : '⚡'}
              </span>
              <span style={{ fontSize: '15px', color: streak > 0 ? '#F59E0B' : '#64748B', fontWeight: '800' }}>{streak}</span>
            </div>
          </div>
        )}

        {user && (
          <button
            onClick={() => navigate("/settings")}
            className="nav-settings-btn"
            style={{
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "10px",
              padding: "8px 16px",
              color: "#06B6D4",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#06B6D4";
              e.currentTarget.style.color = "#0F172A";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(6, 182, 212, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
              e.currentTarget.style.color = "#06B6D4";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <FiSettings style={{ fontSize: "16px" }} />
            <span>Settings</span>
          </button>
        )}

        {!isDashboard && (
          <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
