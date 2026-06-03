import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const currentUser = JSON.parse(localStorage.getItem("user")) || { name: "Anatomy Learner" };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "3D Anatomy", path: "/body-selection", icon: "🫀" },
    { label: "Quizzes", path: "/quiz", icon: "🧬" },
    { label: "Progress Tracking", path: "/learning-progress", icon: "📈" },
  ];

  const headerStyle = {
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  };

  const brandStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  };

  const titleStyle = {
    color: "#06B6D4",
    fontSize: "24px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "1px",
    textShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
  };

  const navListStyle = {
    display: "flex",
    gap: "24px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  };

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
  });

  const profileStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const userGreetingStyle = {
    color: "#E2E8F0",
    fontSize: "14px",
    fontWeight: "500",
  };

  const logoutButtonStyle = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #EF4444, #DC2626)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.25)",
    transition: "all 0.3s ease",
  };

  return (
    <header style={headerStyle}>
      <div style={brandStyle} onClick={() => navigate("/dashboard")}>
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
        <h1 style={titleStyle}>AR AnatomyAI</h1>
      </div>

      <nav>
        <ul style={navListStyle}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === "/body-selection" && 
                (location.pathname === "/organ-selection" || location.pathname === "/ar-viewer"));
            return (
              <li key={item.path}>
                <span
                  onClick={() => navigate(item.path)}
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

      <div style={profileStyle}>
        <span style={userGreetingStyle}>
          👋 Hi, <strong style={{ color: "#06B6D4" }}>{currentUser.name}</strong>
        </span>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.25)";
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
