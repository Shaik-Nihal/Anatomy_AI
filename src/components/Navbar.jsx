import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const rawName = user?.user_metadata?.full_name || user?.email || "Anatomy Learner";
  
  const getSmartName = (fullName) => {
    if (!fullName) return "";
    if (fullName.includes("@")) return fullName.split("@")[0];
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 2) {
      return parts.join(" ");
    }
    return parts.slice(0, 2).join(" ");
  };

  const displayName = getSmartName(rawName);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "3D Anatomy", path: "/body-selection", icon: "🫀" },
    { label: "Quizzes", path: "/quiz", icon: "🧬" },
    { label: "AI Tutor", path: "/ai-tutor", icon: "🤖" },
    { label: "Progress Tracking", path: "/learning-progress", icon: "📈" },
    { label: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const linkStyle = (isActive) => ({
    color: isActive ? "#06B6D4" : "#94A3B8",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "12px",
    background: isActive ? "rgba(6, 182, 212, 0.1)" : "transparent",
    border: "1px solid " + (isActive ? "rgba(6, 182, 212, 0.2)" : "transparent"),
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
  });

  const isDashboard = location.pathname === "/dashboard";

  return (
    <header className="nav-header">
      <div className="nav-brand" onClick={() => navigate("/dashboard")}>
        <img
          src={logo}
          alt="AR AnatomyAI Logo"
          style={{
            width: "48px",
            height: "48px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))",
          }}
        />
        <h1 className="nav-title">AR AnatomyAI</h1>
      </div>

      {!isDashboard && (
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      )}

      {!isDashboard && (
        <nav className={`nav-list ${menuOpen ? "open" : ""}`} style={{ flex: 1, display: menuOpen ? "flex" : undefined, justifyContent: "center" }}>
          <ul className={`nav-list ${menuOpen ? "open" : ""}`}>
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
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
