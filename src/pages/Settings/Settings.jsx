<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabase";
import { getUserProgress, resetUserProgress } from "../../services/quizApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiUser,
  FiLock,
  FiEye,
  FiSliders,
  FiBell,
  FiShield,
  FiDatabase,
  FiInfo,
  FiLogOut,
  FiCheckCircle,
  FiAlertTriangle,
  FiMonitor
} from "react-icons/fi";

// Compress image to Base64 (max 256x256) to fit inside Supabase auth metadata limits
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress heavily using jpeg
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  
  // Password settings state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Appearance state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const val = localStorage.getItem("settings_dark_mode");
    return val !== null ? val === "true" : true;
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("settings_theme_color") || "cyan";
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("settings_font_size") || "medium";
  });
  
  // Learning preferences state
  const [dailyGoal, setDailyGoal] = useState(() => {
    return localStorage.getItem("settings_daily_goal") || "30";
  }); // in minutes
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const val = localStorage.getItem("settings_reminders_enabled");
    return val !== null ? val === "true" : true;
  });
  
  // Notification state
  const [notifEmail, setNotifEmail] = useState(() => {
    const val = localStorage.getItem("settings_notif_email");
    return val !== null ? val === "true" : true;
  });
  const [notifResults, setNotifResults] = useState(() => {
    const val = localStorage.getItem("settings_notif_results");
    return val !== null ? val === "true" : true;
  });
  const [notifProgress, setNotifProgress] = useState(() => {
    const val = localStorage.getItem("settings_notif_progress");
    return val !== null ? val === "true" : false;
  });
  
  // System states
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // success | error | info
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({ os: "Unknown OS", browser: "Unknown Browser" });
  const [othersRevoked, setOthersRevoked] = useState(false);

  useEffect(() => {
    // Parse userAgent for current session display
    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    if (ua.indexOf("Win") !== -1) os = "Windows Desktop";
    else if (ua.indexOf("Mac") !== -1) os = "Mac OS";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("like Mac") !== -1) os = "iOS";

    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Safari") !== -1) browser = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";

    setSessionInfo({ os, browser });
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      if (user.user_metadata?.avatar_url) {
        setProfilePic(user.user_metadata.avatar_url);
      }
    }


  }, [user]);

  // Apply Dark/Light Mode
  useEffect(() => {
    localStorage.setItem("settings_dark_mode", isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("light-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
      document.body.classList.add("light-mode");
    }
  }, [isDarkMode]);

  // Apply Theme Accent Color
  useEffect(() => {
    localStorage.setItem("settings_theme_color", themeColor);
    const hexColor = 
      themeColor === "cyan" ? "#06B6D4" : 
      themeColor === "purple" ? "#A78BFA" : 
      themeColor === "pink" ? "#F472B6" : 
      themeColor === "green" ? "#10B981" : 
      "#3B82F6";
    document.documentElement.style.setProperty("--accent-color", hexColor);
  }, [themeColor]);

  // Apply Font Size
  useEffect(() => {
    localStorage.setItem("settings_font_size", fontSize);
    const sizeMap = {
      small: "13px",
      medium: "14px",
      large: "16px"
    };
    document.documentElement.style.setProperty("--base-font-size", sizeMap[fontSize] || "14px");
  }, [fontSize]);

  // Persist Learning & Notifications Settings

  useEffect(() => {
    localStorage.setItem("settings_daily_goal", dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("settings_reminders_enabled", remindersEnabled);
  }, [remindersEnabled]);

  useEffect(() => {
    localStorage.setItem("settings_notif_email", notifEmail);
  }, [notifEmail]);

  useEffect(() => {
    localStorage.setItem("settings_notif_results", notifResults);
  }, [notifResults]);

  useEffect(() => {
    localStorage.setItem("settings_notif_progress", notifProgress);
  }, [notifProgress]);

  // Trigger Toast Notification
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarBase64 = user?.user_metadata?.avatar_url || null;
      
      // If a new picture was uploaded (File object), compress it to base64
      if (profilePic && typeof profilePic !== "string") {
        showToast("Compressing profile picture...", "info");
        avatarBase64 = await compressImage(profilePic);
      }

      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarBase64
        }
      });
      if (error) throw error;
      
      if (profilePic && typeof profilePic !== "string") {
        setProfilePic(avatarBase64); // Update local state to the compressed base64
      }
      
      showToast("Profile details updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  // Sign out confirmation
  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Terminate concurrently running other sessions
  const handleRevokeSession = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      showToast("Successfully terminated all other active client logins.", "success");
      setOthersRevoked(true);
    } catch (err) {
      showToast("Failed to revoke session: " + err.message, "error");
    }
  };

  // Functional Data Exporters
  const handleExportProgress = async () => {
    if (!email) return;
    showToast("Preparing your progress report export...", "info");
    try {
      const progress = await getUserProgress(email);
      if (!progress || progress.length === 0) {
        showToast("No progress records found to export.", "error");
        return;
      }
      const headers = ["Attempt ID", "Organ", "Difficulty", "Score", "Total Questions", "Percentage", "Weak Areas", "Attempted At"];
      const rows = progress.map(item => [
        item.id,
        item.organ,
        item.difficulty,
        item.score,
        item.total_questions,
        `${Math.round(item.percentage)}%`,
        (item.weak_areas || "").replace(/,/g, ";"),
        item.attempted_at
      ]);
      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ARAnatomy_Progress_${email.split('@')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV progress file downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to export progress report: " + err.message, "error");
    }
  };

  const handleDownloadPDF = async () => {
    if (!email) return;
    showToast("Generating PDF report...", "info");
    try {
      const progress = await getUserProgress(email);
      if (!progress || progress.length === 0) {
        showToast("No quiz results found to download.", "error");
        return;
      }
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(6, 182, 212); // #06B6D4
      doc.text("AnatomyAI Quiz Progress Report", 14, 22);
      
      // Subtitle
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated for: ${email}`, 14, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);

      // Table Data
      const tableColumn = ["Date", "Organ", "Difficulty", "Score", "Accuracy", "Weak Areas"];
      const tableRows = [];

      progress.forEach(item => {
        const rowData = [
          new Date(item.attempted_at).toLocaleDateString(),
          item.organ,
          item.difficulty,
          `${item.score}/${item.total_questions}`,
          `${Math.round(item.percentage)}%`,
          (item.weak_areas || "None").replace(/,/g, ", ")
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [6, 182, 212], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`AnatomyAI_Progress_Report_${email.split('@')[0]}.pdf`);
      showToast("PDF report downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to generate PDF report: " + err.message, "error");
    }
  };

  const handleResetProgress = async () => {
    if (!email) return;
    const confirmReset = window.confirm("WARNING: Are you sure you want to permanently delete all learning history? This action cannot be undone.");
    if (!confirmReset) return;
    
    setLoading(true);
    try {
      await resetUserProgress(email);
      showToast("All learning history and quiz records have been reset.", "success");
    } catch (err) {
      showToast("Failed to reset progress: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "profile", label: "Profile Settings", icon: <FiUser /> },
    { id: "account", label: "Account Security", icon: <FiLock /> },
    { id: "appearance", label: "Appearance", icon: <FiEye /> },
    { id: "learning", label: "Learning Preferences", icon: <FiSliders /> },
    { id: "notifications", label: "Notifications", icon: <FiBell /> },
    { id: "privacy", label: "Privacy & Sessions", icon: <FiShield /> },
    { id: "data", label: "Data & Progress", icon: <FiDatabase /> },
    { id: "about", label: "About App", icon: <FiInfo /> }
  ];

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content" style={{ padding: "24px 30px" }}>
        
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <span style={{ fontSize: "22px" }}>⚙️</span>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: "24px", color: "#fff" }}>Account Settings</h1>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            background: toastType === "success" ? "rgba(16, 185, 129, 0.95)" : toastType === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(59, 130, 246, 0.95)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out",
            backdropFilter: "blur(10px)"
          }}>
            <FiCheckCircle />
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{toastMessage}</span>
          </div>
        )}

        {/* Settings Layout Split View */}
        <div className="settings-container-grid">
          
          {/* Left Menu Sidebar */}
          <div className="glass-card-new settings-sidebar-wrapper">
            <div className="settings-tabs-list">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`settings-tab-btn ${activeTab === cat.id ? "active" : ""}`}
                >
                  <span className="tab-icon">{cat.icon}</span>
                  <span className="tab-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Panels */}
          <div className="glass-card-new settings-panel-wrapper">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="settings-form-panel">
                <h2 className="panel-title">Profile Settings</h2>
                <p className="panel-desc">Manage your public display details and credentials.</p>
                
                <div className="form-group-new">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input-field"
                    required
                  />
                </div>

                <div className="form-group-new">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="form-input-field disabled"
                    title="Email address cannot be changed."
                  />
                  <small style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", display: "block" }}>
                    Primary email is locked for account safety.
                  </small>
                </div>

                <div className="form-group-new">
                  <label>Profile Picture</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "white",
                      overflow: "hidden"
                    }}>
                      {profilePic ? (
                        <img 
                          src={typeof profilePic === "string" ? profilePic : URL.createObjectURL(profilePic)} 
                          alt="Profile" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        fullName ? fullName.charAt(0).toUpperCase() : "A"
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePic(e.target.files[0])}
                        style={{ display: "none" }}
                        id="profile-pic-upload"
                      />
                      <label htmlFor="profile-pic-upload" className="settings-action-btn secondary" style={{ cursor: "pointer", display: "inline-block" }}>
                        Choose Photo
                      </label>
                      <small style={{ color: "#64748B", fontSize: "11px", display: "block", marginTop: "4px" }}>
                        PNG or JPG. Maximum 2MB.
                      </small>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="settings-action-btn primary" style={{ width: "fit-content", marginTop: "10px" }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* ACCOUNT SECURITY TAB */}
            {activeTab === "account" && (
              <form onSubmit={handleUpdatePassword} className="settings-form-panel">
                <h2 className="panel-title">Account Security</h2>
                <p className="panel-desc">Update your authorization passwords to lock your records.</p>
                
                <div className="form-group-new">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="form-input-field"
                    minLength={6}
                  />
                </div>

                <div className="form-group-new">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify your new password"
                    className="form-input-field"
                    minLength={6}
                  />
                </div>

                <button type="submit" disabled={loading} className="settings-action-btn primary" style={{ width: "fit-content", marginTop: "10px" }}>
                  {loading ? "Updating..." : "Update Password"}
                </button>

                {/* Relocated Logout Option inside Danger Zone */}
                <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#EF4444", margin: "0 0 8px 0" }}>Danger Zone</h3>
                  <p style={{ fontSize: "13px", color: "#94A3B8", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                    Sign out of your AR AnatomyAI account on this device.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="settings-action-btn"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      color: "#EF4444",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      width: "fit-content"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#EF4444";
                      e.currentTarget.style.color = "#FFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      e.currentTarget.style.color = "#EF4444";
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </form>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Appearance Settings</h2>
                <p className="panel-desc">Personalize client themes and viewing sizes.</p>

                <div className="form-group-new">
                  <label>Visual Mode</label>
                  <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(true)}
                      className={`settings-tab-btn theme-select ${isDarkMode ? "active" : ""}`}
                      style={{ padding: "10px 20px", width: "auto" }}
                    >
                      🌑 Dark Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(false)}
                      className={`settings-tab-btn theme-select ${!isDarkMode ? "active" : ""}`}
                      style={{ padding: "10px 20px", width: "auto" }}
                    >
                      ☀️ Light Mode
                    </button>
                  </div>
                </div>

                <div className="form-group-new">
                  <label>Theme Accent Color</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    {["cyan", "purple", "pink", "green", "blue"].map((color) => {
                      const hexColor = color === "cyan" ? "#06B6D4" : color === "purple" ? "#A78BFA" : color === "pink" ? "#F472B6" : color === "green" ? "#10B981" : "#3B82F6";
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setThemeColor(color);
                            showToast(`Accent color updated to ${color}!`, "success");
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: hexColor,
                            border: themeColor === color ? "3px solid white" : "none",
                            cursor: "pointer",
                            transform: themeColor === color ? "scale(1.1)" : "scale(1)",
                            transition: "all 0.2s"
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="form-group-new">
                  <label>Font Size Preference</label>
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      showToast("Font size updated!", "success");
                    }}
                    className="form-input-field"
                    style={{ background: "#0a0f1d" }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            )}

            {/* LEARNING PREFERENCES TAB */}
            {activeTab === "learning" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Learning Preferences</h2>
                <p className="panel-desc">Configure default training modules and goals.</p>



                <div className="form-group-new">
                  <label>Daily Study Goal ({dailyGoal} Minutes)</label>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    step="5"
                    className="premium-slider"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    style={{ marginTop: "10px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "11px", marginTop: "4px" }}>
                    <span>10 Min</span>
                    <span>90 Min</span>
                    <span>180 Min</span>
                  </div>
                </div>

                <div className="premium-setting-item">
                  <div>
                    <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Daily Learning Reminders</div>
                    <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Remind me to study daily to preserve my streak.</div>
                  </div>
                  <label className="toggle-wrapper">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={remindersEnabled}
                      onChange={(e) => setRemindersEnabled(e.target.checked)}
                    />
                    <div className="toggle-bg">
                      <div className="toggle-circle"></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Notifications</h2>
                <p className="panel-desc">Configure automated mailers and results broadcasts.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "6px" }}>
                  <div className="premium-setting-item">
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Email Notifications</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Receive system notices via email.</div>
                    </div>
                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifEmail}
                        onChange={(e) => {
                          setNotifEmail(e.target.checked);
                          showToast("Notification preferences updated.", "success");
                        }}
                      />
                      <div className="toggle-bg">
                        <div className="toggle-circle"></div>
                      </div>
                    </label>
                  </div>

                  <div className="premium-setting-item">
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Quiz Results Alerts</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Broadcasting summaries of finished assessments.</div>
                    </div>
                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifResults}
                        onChange={(e) => {
                          setNotifResults(e.target.checked);
                          showToast("Notification preferences updated.", "success");
                        }}
                      />
                      <div className="toggle-bg">
                        <div className="toggle-circle"></div>
                      </div>
                    </label>
                  </div>

                  <div className="premium-setting-item">
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Progress Updates Notifications</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Weekly analysis of study time and mastery charts.</div>
                    </div>
                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifProgress}
                        onChange={(e) => {
                          setNotifProgress(e.target.checked);
                          showToast("Notification preferences updated.", "success");
                        }}
                      />
                      <div className="toggle-bg">
                        <div className="toggle-circle"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY & SECURITY TAB */}
            {activeTab === "privacy" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Privacy & Sessions</h2>
                <p className="panel-desc">Manage authentication nodes and concurrent login points.</p>



                <div className="form-group-new">
                  <label>Session Management</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <FiMonitor style={{ color: "#06B6D4", fontSize: "20px" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{sessionInfo.os} ({sessionInfo.browser})</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Local Network • (Current Session)</div>
                      </div>
                      <span style={{ fontSize: "10px", color: "#10B981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>ACTIVE</span>
                    </div>

                    {!othersRevoked ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <FiMonitor style={{ color: "#94A3B8", fontSize: "20px" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>Other signed-in devices</div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>Previously authorized browsers or mobile apps</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRevokeSession}
                          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "10px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                        >
                          REVOKE OTHERS
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <FiMonitor style={{ color: "#94A3B8", fontSize: "20px", opacity: 0.5 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>No other signed-in devices</div>
                          <div style={{ fontSize: "11px", color: "#475569" }}>All other sessions have been terminated.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DATA & PROGRESS TAB */}
            {activeTab === "data" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Data & Progress</h2>
                <p className="panel-desc">Export, download, or clear your analytics database.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Export Progress Report</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Download an Excel/CSV log of your anatomy quiz performance.</div>
                    </div>
                    <button type="button" onClick={handleExportProgress} className="settings-action-btn secondary">
                      Export CSV
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Download PDF Report</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Get a formatted PDF document containing your quiz history.</div>
                    </div>
                    <button type="button" onClick={handleDownloadPDF} className="settings-action-btn secondary">
                      Download PDF
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(239,68,68,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#F87171", fontSize: "14px" }}>Reset Learning Progress</div>
                      <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "2px" }}>Warning: This deletes all scores, accuracy levels, and analytics.</div>
                    </div>
                    <button type="button" onClick={handleResetProgress} className="settings-action-btn" style={{ background: "#EF4444", color: "white", border: "none" }}>
                      Reset Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <div className="settings-form-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                  borderRadius: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 10px 25px rgba(6, 182, 212, 0.4)",
                  transform: "rotate(-5deg)"
                }}>
                  <FiInfo style={{ fontSize: "40px", color: "white", transform: "rotate(5deg)" }} />
                </div>
                
                <h2 style={{ fontSize: "28px", fontWeight: 800, color: "white", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>AR AnatomyAI</h2>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                  <div style={{ 
                    background: "rgba(6, 182, 212, 0.15)", 
                    border: "1px solid rgba(6, 182, 212, 0.3)", 
                    color: "#06B6D4", 
                    padding: "4px 12px", 
                    borderRadius: "20px", 
                    fontSize: "12px", 
                    fontWeight: 700
                  }}>
                    v1.2.4 (Stable Build)
                  </div>
                </div>

                <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.6", maxWidth: "400px", margin: "0 auto 32px" }}>
                  A next-generation interactive learning platform utilizing advanced AI and augmented reality to master human anatomy.
                </p>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                  <div style={{ 
                    background: "rgba(255,255,255,0.02)", 
                    border: "1px solid rgba(255,255,255,0.05)", 
                    borderRadius: "16px", 
                    padding: "20px",
                    width: "100%",
                    maxWidth: "400px",
                    textAlign: "left"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ color: "#64748B", fontSize: "13px", fontWeight: 600 }}>Engine Core</span>
                      <span style={{ color: "white", fontSize: "13px", fontWeight: 500 }}>React 19 + ThreeJS</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748B", fontSize: "13px", fontWeight: 600 }}>AI Models</span>
                      <span style={{ color: "white", fontSize: "13px", fontWeight: 500 }}>Google Gemini Pro</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Meet the Developers</h3>
                  <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
                    
                    {/* Developer 1 */}
                    <div style={{ 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.05)", 
                      borderRadius: "16px", 
                      padding: "20px 16px",
                      width: "180px",
                      textAlign: "center",
                      transition: "transform 0.3s ease, border-color 0.3s ease",
                      cursor: "default"
                    }} className="developer-card">
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 12px", background: "linear-gradient(135deg, #06B6D4, #3B82F6)", padding: "2px" }}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nihal&backgroundColor=b6e3f4" alt="Shaik Nihal" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1E293B" }} />
                      </div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}>Shaik Nihal</div>
                      <div style={{ color: "#06B6D4", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead AI & Full-Stack</div>
                    </div>

                    {/* Developer 2 */}
                    <div style={{ 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.05)", 
                      borderRadius: "16px", 
                      padding: "20px 16px",
                      width: "180px",
                      textAlign: "center",
                      transition: "transform 0.3s ease, border-color 0.3s ease",
                      cursor: "default"
                    }} className="developer-card">
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 12px", background: "linear-gradient(135deg, #10B981, #059669)", padding: "2px" }}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jaajitha&backgroundColor=c0aede" alt="P Jaajitha Reddy" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1E293B" }} />
                      </div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}>P Jaajitha Reddy</div>
                      <div style={{ color: "#10B981", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead UI/UX Designer</div>
                    </div>

                    {/* Developer 3 */}
                    <div style={{ 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.05)", 
                      borderRadius: "16px", 
                      padding: "20px 16px",
                      width: "180px",
                      textAlign: "center",
                      transition: "transform 0.3s ease, border-color 0.3s ease",
                      cursor: "default"
                    }} className="developer-card">
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 12px", background: "linear-gradient(135deg, #F59E0B, #D97706)", padding: "2px" }}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Durga&backgroundColor=fcd34d" alt="S Durga Sri" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1E293B" }} />
                      </div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}>S Durga Sri</div>
                      <div style={{ color: "#F59E0B", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Data Researcher</div>
                    </div>

                    {/* Developer 4 */}
                    <div style={{ 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.05)", 
                      borderRadius: "16px", 
                      padding: "20px 16px",
                      width: "180px",
                      textAlign: "center",
                      transition: "transform 0.3s ease, border-color 0.3s ease",
                      cursor: "default"
                    }} className="developer-card">
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 12px", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", padding: "2px" }}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kiran&backgroundColor=ddd6fe" alt="I Kiran Kumar" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1E293B" }} />
                      </div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}>I Kiran Kumar</div>
                      <div style={{ color: "#8B5CF6", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Backend Developer</div>
                    </div>

                    {/* Developer 5 */}
                    <div style={{ 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid rgba(255,255,255,0.05)", 
                      borderRadius: "16px", 
                      padding: "20px 16px",
                      width: "180px",
                      textAlign: "center",
                      transition: "transform 0.3s ease, border-color 0.3s ease",
                      cursor: "default"
                    }} className="developer-card">
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 12px", background: "linear-gradient(135deg, #F43F5E, #E11D48)", padding: "2px" }}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Monika&backgroundColor=fecdd3" alt="L Monika" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1E293B" }} />
                      </div>
                      <div style={{ color: "white", fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}>L Monika</div>
                      <div style={{ color: "#F43F5E", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>QA Engineer</div>
                    </div>

                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                  <button 
                    onClick={() => showToast("Showing Terms & Conditions.", "info")}
                    className="settings-action-btn secondary"
                    style={{ padding: "10px 20px", borderRadius: "12px" }}
                  >
                    Terms of Service
                  </button>
                  <button 
                    onClick={() => showToast("Displaying Privacy Policy.", "info")}
                    className="settings-action-btn secondary"
                    style={{ padding: "10px 20px", borderRadius: "12px" }}
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Custom Logout Confirmation Popup Modal Overlay */}
      {showLogoutModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-card-new" style={{
            width: "90%",
            maxWidth: "400px",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(239, 68, 68, 0.08)",
            textAlign: "center",
            padding: "30px",
            background: "rgba(15, 23, 42, 0.9)"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#EF4444",
              margin: "0 auto 16px"
            }}>
              <FiAlertTriangle />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px", color: "white" }}>
              Confirm Sign Out
            </h3>
            
            <p style={{ color: "#94A3B8", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.5 }}>
              Are you sure you want to log out?
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="settings-action-btn secondary"
                style={{ flex: 1, padding: "12px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="settings-action-btn"
                style={{ flex: 1, background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none", color: "white", padding: "12px" }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Settings.css";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.png";
import HologramLogo from "../../components/HologramLogo";
import { supabase } from "../../services/supabase";
import { getUserProgress, resetUserProgress } from "../../services/quizApi";
import { jsPDF } from "jspdf";
import confetti from "canvas-confetti";
import autoTable from "jspdf-autotable";
import { playHoverSound, playClickSound, playWhooshSound } from "../../utils/audio";
import {
  FiUser,
  FiLock,
  FiEye,
  FiSliders,
  FiBell,
  FiShield,
  FiDatabase,
  FiInfo,
  FiLogOut,
  FiCheckCircle,
  FiAlertTriangle,
  FiMonitor
} from "react-icons/fi";

// Compress image to Base64 (max 256x256) to fit inside Supabase auth metadata limits
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress heavily using jpeg
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  
  // Password settings state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Appearance state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const val = localStorage.getItem("settings_dark_mode");
    return val !== null ? val === "true" : true;
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("settings_theme_color") || "cyan";
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("settings_font_size") || "medium";
  });
  
  // Learning preferences state
  const [dailyGoal, setDailyGoal] = useState(() => {
    return localStorage.getItem("settings_daily_goal") || "30";
  }); // in minutes
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const val = localStorage.getItem("settings_reminders_enabled");
    return val !== null ? val === "true" : true;
  });
  
  // Notification state
  const [notifEmail, setNotifEmail] = useState(() => {
    const val = localStorage.getItem("settings_notif_email");
    return val !== null ? val === "true" : true;
  });
  const [notifResults, setNotifResults] = useState(() => {
    const val = localStorage.getItem("settings_notif_results");
    return val !== null ? val === "true" : true;
  });
  const [notifProgress, setNotifProgress] = useState(() => {
    const val = localStorage.getItem("settings_notif_progress");
    return val !== null ? val === "true" : false;
  });
  
  // System states
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // success | error | info
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({ os: "Unknown OS", browser: "Unknown Browser" });
  const [othersRevoked, setOthersRevoked] = useState(false);

  // Easter Egg states
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);

  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 1200);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  const handleLogoClick = () => {
    if (easterEggActive) return; // Prevent multiple triggers
    setLogoClickCount(prev => prev + 1);
    
    if (logoClickCount === 4) {
      // Trigger confetti explosion on 5th click
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      setEasterEggActive(true);
      setShowSecretModal(true);
      setLogoClickCount(0); // reset
    }
  };

  useEffect(() => {
    // Parse userAgent for current session display
    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    if (ua.indexOf("Win") !== -1) os = "Windows Desktop";
    else if (ua.indexOf("Mac") !== -1) os = "Mac OS";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("like Mac") !== -1) os = "iOS";

    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Safari") !== -1) browser = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";

    setSessionInfo({ os, browser });
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      if (user.user_metadata?.avatar_url) {
        setProfilePic(user.user_metadata.avatar_url);
      }
    }


  }, [user]);

  // Apply Dark/Light Mode
  useEffect(() => {
    localStorage.setItem("settings_dark_mode", isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("light-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
      document.body.classList.add("light-mode");
    }
  }, [isDarkMode]);

  // Apply Theme Accent Color
  useEffect(() => {
    localStorage.setItem("settings_theme_color", themeColor);
    const hexColor = 
      themeColor === "cyan" ? "#06B6D4" : 
      themeColor === "purple" ? "#A78BFA" : 
      themeColor === "pink" ? "#F472B6" : 
      themeColor === "green" ? "#10B981" : 
      "#3B82F6";
    document.documentElement.style.setProperty("--accent-color", hexColor);
  }, [themeColor]);

  // Apply Font Size
  useEffect(() => {
    localStorage.setItem("settings_font_size", fontSize);
    const sizeMap = {
      small: "13px",
      medium: "14px",
      large: "16px"
    };
    document.documentElement.style.setProperty("--base-font-size", sizeMap[fontSize] || "14px");
  }, [fontSize]);

  // Persist Learning & Notifications Settings

  useEffect(() => {
    localStorage.setItem("settings_daily_goal", dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("settings_reminders_enabled", remindersEnabled);
  }, [remindersEnabled]);

  useEffect(() => {
    localStorage.setItem("settings_notif_email", notifEmail);
  }, [notifEmail]);

  useEffect(() => {
    localStorage.setItem("settings_notif_results", notifResults);
  }, [notifResults]);

  useEffect(() => {
    localStorage.setItem("settings_notif_progress", notifProgress);
  }, [notifProgress]);

  // Trigger Toast Notification
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarBase64 = user?.user_metadata?.avatar_url || null;
      
      // If a new picture was uploaded (File object), compress it to base64
      if (profilePic && typeof profilePic !== "string") {
        showToast("Compressing profile picture...", "info");
        avatarBase64 = await compressImage(profilePic);
      }

      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarBase64
        }
      });
      if (error) throw error;
      
      if (profilePic && typeof profilePic !== "string") {
        setProfilePic(avatarBase64); // Update local state to the compressed base64
      }
      
      showToast("Profile details updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  // Sign out confirmation
  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Terminate concurrently running other sessions
  const handleRevokeSession = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      showToast("Successfully terminated all other active client logins.", "success");
      setOthersRevoked(true);
    } catch (err) {
      showToast("Failed to revoke session: " + err.message, "error");
    }
  };

  // Functional Data Exporters
  const handleExportProgress = async () => {
    if (!email) return;
    showToast("Preparing your progress report export...", "info");
    try {
      const progress = await getUserProgress(email);
      if (!progress || progress.length === 0) {
        showToast("No progress records found to export.", "error");
        return;
      }
      const escapeCSV = (val) => `"${String(val).replace(/"/g, '""')}"`;
      const headers = ["Attempt ID", "Organ", "Difficulty", "Score", "Total Questions", "Percentage", "Weak Areas", "Attempted At"].map(escapeCSV);
      const rows = progress.map(item => [
        item.id,
        item.organ,
        item.difficulty,
        item.score,
        item.total_questions,
        `${Math.round(item.percentage)}%`,
        (item.weak_areas || "").replace(/,/g, ";"),
        item.attempted_at
      ].map(escapeCSV));
      
      const csvContent = [
        escapeCSV("AnatomyAI Quiz Progress Report"),
        escapeCSV(`User Name: ${fullName || "Unknown User"}`),
        escapeCSV(`Generated for: ${email}`),
        escapeCSV(`Date: ${new Date().toLocaleDateString()}`),
        "",
        headers.join(","), 
        ...rows.map(e => e.join(","))
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ARAnatomy_Progress_${email.split('@')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV progress file downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to export progress report: " + err.message, "error");
    }
  };

  const handleDownloadPDF = async () => {
    if (!email) return;
    showToast("Generating PDF report...", "info");
    try {
      const progress = await getUserProgress(email);
      if (!progress || progress.length === 0) {
        showToast("No quiz results found to download.", "error");
        return;
      }
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(6, 182, 212); // #06B6D4
      doc.text("AnatomyAI Quiz Progress Report", 14, 22);
      
      // Subtitle
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`User Name: ${fullName || "Unknown User"}`, 14, 30);
      doc.text(`Generated for: ${email}`, 14, 36);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

      // Table Data
      const tableColumn = ["Date", "Organ", "Difficulty", "Score", "Accuracy", "Weak Areas"];
      const tableRows = [];

      progress.forEach(item => {
        const rowData = [
          new Date(item.attempted_at).toLocaleDateString(),
          item.organ,
          item.difficulty,
          `${item.score}/${item.total_questions}`,
          `${Math.round(item.percentage)}%`,
          (item.weak_areas || "None").replace(/,/g, ", ")
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [6, 182, 212], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`AnatomyAI_Progress_Report_${email.split('@')[0]}.pdf`);
      showToast("PDF report downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to generate PDF report: " + err.message, "error");
    }
  };

  const handleResetProgress = async () => {
    if (!email) return;
    const confirmReset = window.confirm("WARNING: Are you sure you want to permanently delete all learning history? This action cannot be undone.");
    if (!confirmReset) return;
    
    setLoading(true);
    try {
      await resetUserProgress(email);
      showToast("All learning history and quiz records have been reset.", "success");
    } catch (err) {
      showToast("Failed to reset progress: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "profile", label: "Profile Settings", icon: <FiUser /> },
    { id: "account", label: "Account Security", icon: <FiLock /> },
    { id: "appearance", label: "Appearance", icon: <FiEye /> },
    { id: "learning", label: "Learning Preferences", icon: <FiSliders /> },
    { id: "notifications", label: "Notifications", icon: <FiBell /> },
    { id: "privacy", label: "Privacy & Sessions", icon: <FiShield /> },
    { id: "data", label: "Data & Progress", icon: <FiDatabase /> },
    { id: "about", label: "About App", icon: <FiInfo /> }
  ];

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content" style={{ padding: "24px 30px" }}>
        
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <span style={{ fontSize: "22px" }}>⚙️</span>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: "24px", color: "#fff" }}>Account Settings</h1>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            background: toastType === "success" ? "rgba(16, 185, 129, 0.95)" : toastType === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(59, 130, 246, 0.95)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out",
            backdropFilter: "blur(10px)"
          }}>
            <FiCheckCircle />
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{toastMessage}</span>
          </div>
        )}

        {/* Settings Layout Split View */}
        <div className="settings-container-grid">
          
          {/* Left Menu Sidebar */}
          <div className="glass-card-new settings-sidebar-wrapper">
            <div className="settings-tabs-list">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`settings-tab-btn ${activeTab === cat.id ? "active" : ""}`}
                >
                  <span className="tab-icon">{cat.icon}</span>
                  <span className="tab-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Panels */}
          <div className="glass-card-new settings-panel-wrapper">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="settings-form-panel">
                <h2 className="panel-title">Profile Settings</h2>
                <p className="panel-desc">Manage your public display details and credentials.</p>
                
                <div className="form-group-new">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input-field"
                    required
                  />
                </div>

                <div className="form-group-new">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="form-input-field disabled"
                    title="Email address cannot be changed."
                  />
                  <small style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", display: "block" }}>
                    Primary email is locked for account safety.
                  </small>
                </div>

                <div className="form-group-new">
                  <label>Profile Picture</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "white",
                      overflow: "hidden"
                    }}>
                      {profilePic ? (
                        <img 
                          src={typeof profilePic === "string" ? profilePic : URL.createObjectURL(profilePic)} 
                          alt="Profile" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        fullName ? fullName.charAt(0).toUpperCase() : "A"
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePic(e.target.files[0])}
                        style={{ display: "none" }}
                        id="profile-pic-upload"
                      />
                      <label htmlFor="profile-pic-upload" className="settings-action-btn secondary" style={{ cursor: "pointer", display: "inline-block" }}>
                        Choose Photo
                      </label>
                      <small style={{ color: "#64748B", fontSize: "11px", display: "block", marginTop: "4px" }}>
                        PNG or JPG. Maximum 2MB.
                      </small>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="settings-action-btn primary" style={{ width: "fit-content", marginTop: "10px" }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* ACCOUNT SECURITY TAB */}
            {activeTab === "account" && (
              <form onSubmit={handleUpdatePassword} className="settings-form-panel">
                <h2 className="panel-title">Account Security</h2>
                <p className="panel-desc">Update your authorization passwords to lock your records.</p>
                
                <div className="form-group-new">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="form-input-field"
                    minLength={6}
                  />
                </div>

                <div className="form-group-new">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify your new password"
                    className="form-input-field"
                    minLength={6}
                  />
                </div>

                <button type="submit" disabled={loading} className="settings-action-btn primary" style={{ width: "fit-content", marginTop: "10px" }}>
                  {loading ? "Updating..." : "Update Password"}
                </button>

                {/* Relocated Logout Option inside Danger Zone */}
                <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#EF4444", margin: "0 0 8px 0" }}>Danger Zone</h3>
                  <p style={{ fontSize: "13px", color: "#94A3B8", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                    Sign out of your AR AnatomyAI account on this device.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="settings-action-btn"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      color: "#EF4444",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      width: "fit-content"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#EF4444";
                      e.currentTarget.style.color = "#FFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      e.currentTarget.style.color = "#EF4444";
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </form>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Appearance Settings</h2>
                <p className="panel-desc">Personalize client themes and viewing sizes.</p>

                <div className="form-group-new">
                  <label>Visual Mode</label>
                  <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(true)}
                      className={`settings-tab-btn theme-select ${isDarkMode ? "active" : ""}`}
                      style={{ padding: "10px 20px", width: "auto" }}
                    >
                      🌑 Dark Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(false)}
                      className={`settings-tab-btn theme-select ${!isDarkMode ? "active" : ""}`}
                      style={{ padding: "10px 20px", width: "auto" }}
                    >
                      ☀️ Light Mode
                    </button>
                  </div>
                </div>

                <div className="form-group-new">
                  <label>Theme Accent Color</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    {["cyan", "purple", "pink", "green", "blue"].map((color) => {
                      const hexColor = color === "cyan" ? "#06B6D4" : color === "purple" ? "#A78BFA" : color === "pink" ? "#F472B6" : color === "green" ? "#10B981" : "#3B82F6";
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setThemeColor(color);
                            showToast(`Accent color updated to ${color}!`, "success");
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: hexColor,
                            border: themeColor === color ? "3px solid white" : "none",
                            cursor: "pointer",
                            transform: themeColor === color ? "scale(1.1)" : "scale(1)",
                            transition: "all 0.2s"
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="form-group-new">
                  <label>Font Size Preference</label>
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      showToast("Font size updated!", "success");
                    }}
                    className="form-input-field"
                    style={{ background: "#0a0f1d" }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            )}

            {/* LEARNING PREFERENCES TAB */}
            {activeTab === "learning" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Learning Preferences</h2>
                <p className="panel-desc">Configure default training modules and goals.</p>



                <div className="form-group-new">
                  <label>Daily Study Goal ({dailyGoal} Minutes)</label>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    step="5"
                    className="premium-slider"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    style={{ marginTop: "10px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "11px", marginTop: "4px" }}>
                    <span>10 Min</span>
                    <span>90 Min</span>
                    <span>180 Min</span>
                  </div>
                </div>

                <div className="premium-setting-item">
                  <div>
                    <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Daily Learning Reminders</div>
                    <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Remind me to study daily to preserve my streak.</div>
                  </div>
                  <label className="toggle-wrapper">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={remindersEnabled}
                      onChange={(e) => setRemindersEnabled(e.target.checked)}
                    />
                    <div className="toggle-bg">
                      <div className="toggle-circle"></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Notifications</h2>
                <p className="panel-desc">Configure automated mailers and results broadcasts.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "6px" }}>
                  <div className="premium-setting-item">
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Email Notifications</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Receive system notices via email.</div>
                    </div>
                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifEmail}
                        onChange={(e) => {
                          setNotifEmail(e.target.checked);
                          showToast("Notification preferences updated.", "success");
                        }}
                      />
                      <div className="toggle-bg">
                        <div className="toggle-circle"></div>
                      </div>
                    </label>
                  </div>

                  <div className="premium-setting-item">
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Quiz Results Alerts</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Broadcasting summaries of finished assessments.</div>
                    </div>
                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifResults}
                        onChange={(e) => {
                          setNotifResults(e.target.checked);
                          showToast("Notification preferences updated.", "success");
                        }}
                      />
                      <div className="toggle-bg">
                        <div className="toggle-circle"></div>
                      </div>
                    </label>
                  </div>

                  <div className="premium-setting-item">
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Progress Updates Notifications</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Weekly analysis of study time and mastery charts.</div>
                    </div>
                    <label className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifProgress}
                        onChange={(e) => {
                          setNotifProgress(e.target.checked);
                          showToast("Notification preferences updated.", "success");
                        }}
                      />
                      <div className="toggle-bg">
                        <div className="toggle-circle"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY & SECURITY TAB */}
            {activeTab === "privacy" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Privacy & Sessions</h2>
                <p className="panel-desc">Manage authentication nodes and concurrent login points.</p>



                <div className="form-group-new">
                  <label>Session Management</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <FiMonitor style={{ color: "#06B6D4", fontSize: "20px" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{sessionInfo.os} ({sessionInfo.browser})</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Local Network • (Current Session)</div>
                      </div>
                      <span style={{ fontSize: "10px", color: "#10B981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>ACTIVE</span>
                    </div>

                    {!othersRevoked ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <FiMonitor style={{ color: "#94A3B8", fontSize: "20px" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#CBD5E1" }}>Other signed-in devices</div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>Previously authorized browsers or mobile apps</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRevokeSession}
                          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "10px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                        >
                          REVOKE OTHERS
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <FiMonitor style={{ color: "#94A3B8", fontSize: "20px", opacity: 0.5 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>No other signed-in devices</div>
                          <div style={{ fontSize: "11px", color: "#475569" }}>All other sessions have been terminated.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DATA & PROGRESS TAB */}
            {activeTab === "data" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Data & Progress</h2>
                <p className="panel-desc">Export, download, or clear your analytics database.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Export Progress Report</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Download an Excel/CSV log of your anatomy quiz performance.</div>
                    </div>
                    <button type="button" onClick={handleExportProgress} className="settings-action-btn secondary">
                      Export CSV
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Download PDF Report</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Get a formatted PDF document containing your quiz history.</div>
                    </div>
                    <button type="button" onClick={handleDownloadPDF} className="settings-action-btn secondary">
                      Download PDF
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(239,68,68,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#F87171", fontSize: "14px" }}>Reset Learning Progress</div>
                      <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "2px" }}>Warning: This deletes all scores, accuracy levels, and analytics.</div>
                    </div>
                    <button type="button" onClick={handleResetProgress} className="settings-action-btn" style={{ background: "#EF4444", color: "white", border: "none" }}>
                      Reset Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="settings-form-panel" 
                style={{ textAlign: "center", padding: "50px 20px", position: "relative", overflow: "hidden" }}
              >
                {/* Background glow for the panel */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: "-50px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(0,0,0,0) 70%)",
                    filter: "blur(50px)",
                    zIndex: 0
                  }} 
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <motion.div 
                    onClick={handleLogoClick}
                    whileTap={{ scale: 0.9 }}
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    style={{
                      width: "130px",
                      height: "130px",
                      background: easterEggActive ? "rgba(236, 72, 153, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      borderRadius: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 28px",
                      border: easterEggActive ? "1px solid rgba(236, 72, 153, 0.8)" : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: easterEggActive ? "0 15px 50px rgba(236, 72, 153, 0.6), inset 0 0 30px rgba(236, 72, 153, 0.4)" : "0 15px 35px rgba(0,0,0,0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)",
                      backdropFilter: "blur(15px)",
                      padding: "8px",
                      overflow: "visible",
                      cursor: "pointer",
                      transition: "all 0.5s ease"
                    }}
                  >
                    <HologramLogo />
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ fontSize: "36px", fontWeight: 800, color: "white", margin: "0 0 16px 0", letterSpacing: "-0.5px" }}
                  >
                    AR Anatomy<span style={{ color: "#06B6D4" }}>AI</span>
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" }}
                      style={{ 
                        background: "linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))", 
                        border: "1px solid rgba(6, 182, 212, 0.4)", 
                        color: "#38bdf8", 
                        padding: "6px 20px", 
                        borderRadius: "20px", 
                        fontSize: "13px", 
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }} />
                      v1.2.4 (Stable Build)
                    </motion.div>
                  </motion.div>

                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    style={{ color: "#94A3B8", fontSize: "16px", lineHeight: "1.7", maxWidth: "480px", margin: "0 auto 48px" }}
                  >
                    A next-generation interactive learning platform utilizing advanced AI and augmented reality to master human anatomy.
                  </motion.p>

                  {/* Core Specs */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "56px", flexWrap: "wrap" }}>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5, borderColor: "rgba(6, 182, 212, 0.4)", boxShadow: "0 10px 30px rgba(6, 182, 212, 0.15)" }}
                      style={{ 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "24px", 
                        padding: "20px 24px",
                        width: "100%",
                        maxWidth: "260px",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        backdropFilter: "blur(12px)",
                        cursor: "pointer",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease"
                      }}
                    >
                      <div style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))", padding: "14px", borderRadius: "16px", color: "#06B6D4", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
                        <FiMonitor size={26} />
                      </div>
                      <div>
                        <div style={{ color: "#64748B", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Engine Core</div>
                        <div style={{ color: "white", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}>React 19 + ThreeJS</div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05, y: -5, borderColor: "rgba(167, 139, 250, 0.4)", boxShadow: "0 10px 30px rgba(167, 139, 250, 0.15)" }}
                      style={{ 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "24px", 
                        padding: "20px 24px",
                        width: "100%",
                        maxWidth: "260px",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        backdropFilter: "blur(12px)",
                        cursor: "pointer",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease"
                      }}
                    >
                      <div style={{ background: "linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(167, 139, 250, 0.05))", padding: "14px", borderRadius: "16px", color: "#A78BFA", border: "1px solid rgba(167, 139, 250, 0.2)" }}>
                        <FiDatabase size={26} />
                      </div>
                      <div>
                        <div style={{ color: "#64748B", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>AI Models</div>
                        <div style={{ color: "white", fontSize: "15px", fontWeight: 700, marginTop: "4px" }}>Google Gemini Pro</div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    onViewportEnter={() => playWhooshSound()} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.6 }} 
                    style={{ textAlign: "center", marginBottom: "48px" }}
                  >
                    <div style={{ display: "inline-block", position: "relative" }}>
                      <h3 style={{ color: "white", fontSize: "22px", fontWeight: 800, marginBottom: "32px", letterSpacing: "-0.5px" }}>Meet the Team</h3>
                      <div style={{ position: "absolute", bottom: "16px", left: "20%", width: "60%", height: "4px", background: "linear-gradient(90deg, transparent, #06B6D4, transparent)", borderRadius: "2px" }} />
                    </div>
                    
                    <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto" }}>
                      
                      {[
                        { name: "Shaik Nihal", role: "Developer", color: "#06B6D4", seed: "Nihal", bg: "b6e3f4" },
                        { name: "P Jaajitha Reddy", role: "Developer", color: "#10B981", seed: "Jaajitha", bg: "c0aede" },
                        { name: "S Durga Sri", role: "Developer", color: "#F59E0B", seed: "Durga", bg: "fcd34d" },
                        { name: "I Kiran Kumar", role: "Developer", color: "#8B5CF6", seed: "Kiran", bg: "ddd6fe" },
                        { name: "L Monika", role: "Developer", color: "#F43F5E", seed: "Monika", bg: "fecdd3" }
                      ].map((dev, i) => (
                        <motion.div 
                          key={dev.name}
                          initial={{ opacity: 0, y: 40, rotateX: -15, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                          transition={{ delay: 0.7 + (0.1 * i), type: "spring", stiffness: 120, damping: 14 }}
                          onHoverStart={() => playHoverSound()}
                          whileHover={{ 
                            y: -12, 
                            scale: 1.05,
                            rotateY: (i % 2 === 0 ? 5 : -5),
                            borderColor: dev.color,
                            boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 25px ${dev.color}50`,
                            background: "rgba(30, 41, 59, 0.85)"
                          }}
                          style={{ 
                            background: "rgba(30, 41, 59, 0.4)", 
                            border: "1px solid rgba(255,255,255,0.06)", 
                            borderRadius: "24px", 
                            padding: "24px 16px",
                            width: "170px",
                            textAlign: "center",
                            cursor: "pointer",
                            backdropFilter: "blur(20px)",
                            transition: "border-color 0.4s ease, background 0.4s ease",
                            transformStyle: "preserve-3d"
                          }}
                        >
                          <motion.div 
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut" }}
                            style={{ 
                              width: "80px", 
                              height: "80px", 
                              borderRadius: "50%", 
                              margin: "0 auto 16px", 
                              background: `linear-gradient(135deg, ${dev.color}, #0F172A)`, 
                              padding: "3px",
                              boxShadow: `0 0 20px ${dev.color}50, inset 0 2px 5px rgba(255,255,255,0.3)`
                            }}
                          >
                            <motion.img 
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.8, ease: "anticipate" }}
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.seed}&backgroundColor=${dev.bg}`} 
                              alt={dev.name} 
                              style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#0F172A", border: "3px solid #0F172A", objectFit: "cover" }} 
                            />
                          </motion.div>
                          <div style={{ color: "white", fontWeight: 800, fontSize: "15px", marginBottom: "6px" }}>{dev.name}</div>
                          <div style={{ color: dev.color, fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>{dev.role}</div>
                        </motion.div>
                      ))}

                    </div>
                  </motion.div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { playClickSound(); setShowTermsModal(true); }}
                      style={{ padding: "12px 24px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(10px)" }}
                    >
                      Terms of Service
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { playClickSound(); setShowPrivacyModal(true); }}
                      style={{ padding: "12px 24px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(10px)" }}
                    >
                      Privacy Policy
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* Custom Logout Confirmation Popup Modal Overlay */}
      {showLogoutModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-card-new" style={{
            width: "90%",
            maxWidth: "400px",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(239, 68, 68, 0.08)",
            textAlign: "center",
            padding: "30px",
            background: "rgba(15, 23, 42, 0.9)"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#EF4444",
              margin: "0 auto 16px"
            }}>
              <FiAlertTriangle />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px", color: "white" }}>
              Confirm Sign Out
            </h3>
            
            <p style={{ color: "#94A3B8", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.5 }}>
              Are you sure you want to log out?
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="settings-action-btn secondary"
                style={{ flex: 1, padding: "12px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="settings-action-btn"
                style={{ flex: 1, background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none", color: "white", padding: "12px" }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10000, animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-card-new" style={{
            width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(6, 182, 212, 0.08)",
            padding: "32px", background: "rgba(15, 23, 42, 0.95)",
            textAlign: "left", borderRadius: "24px"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <FiInfo color="#06B6D4" /> Terms of Service
            </h2>
            <div style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.7", marginBottom: "30px", maxHeight: "50vh", overflowY: "auto", paddingRight: "10px" }}>
              <p>Welcome to AR AnatomyAI. By using our application, you agree to these terms.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>1. Acceptance of Terms</h4>
              <p>By accessing or using our AR learning platform, you confirm your acceptance of these terms.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>2. User Responsibilities</h4>
              <p>You agree to use this platform strictly for educational and informational purposes. The AI-generated medical analogies and anatomy quiz results do not constitute professional medical advice.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>3. Data Privacy</h4>
              <p>Your quiz attempts and progress are stored securely to track your learning journey. We do not sell your data to third parties.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>4. Modifications</h4>
              <p>We reserve the right to update or modify these terms at any time. Continued use implies acceptance of the updated terms.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowTermsModal(false)}
                className="settings-action-btn"
                style={{ background: "linear-gradient(135deg, #06B6D4, #3B82F6)", border: "none", color: "white", padding: "12px 24px", borderRadius: "12px" }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10000, animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-card-new" style={{
            width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto",
            border: "1px solid rgba(167, 139, 250, 0.25)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(167, 139, 250, 0.08)",
            padding: "32px", background: "rgba(15, 23, 42, 0.95)",
            textAlign: "left", borderRadius: "24px"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <FiEye color="#A78BFA" /> Privacy Policy
            </h2>
            <div style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.7", marginBottom: "30px", maxHeight: "50vh", overflowY: "auto", paddingRight: "10px" }}>
              <p>Your privacy is critically important to us at AR AnatomyAI.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>1. Information We Collect</h4>
              <p>We collect information necessary to provide you with a personalized learning experience, including your email address, quiz scores, and weak anatomical areas.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>2. How We Use Information</h4>
              <p>We use this information to operate the platform, provide AI-driven tutoring (via Google Gemini), and generate personalized progress reports.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>3. Data Protection</h4>
              <p>Your data is secured using industry-standard encryption. Authentication is handled safely by Supabase.</p>
              <h4 style={{ color: "white", marginTop: "16px", marginBottom: "8px" }}>4. Your Rights</h4>
              <p>You have the right to request the deletion of your account and all associated progress data at any time via the Danger Zone in your settings.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="settings-action-btn"
                style={{ background: "linear-gradient(135deg, #A78BFA, #8B5CF6)", border: "none", color: "white", padding: "12px 24px", borderRadius: "12px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Cyberpunk Easter Egg Modal */}
      {showSecretModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.9)", backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10000, animation: "fadeIn 0.2s ease-out"
        }}>
          <div className="glass-card-new" style={{
            width: "90%", maxWidth: "500px",
            border: "2px solid #EC4899",
            boxShadow: "0 0 50px rgba(236, 72, 153, 0.5), inset 0 0 20px rgba(236, 72, 153, 0.3)",
            padding: "40px", background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(88, 28, 135, 0.95))",
            textAlign: "center", borderRadius: "30px"
          }}>
            <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#EC4899", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "2px", textShadow: "0 0 10px #EC4899" }}>
              CYBERPUNK MODE UNLOCKED
            </h2>
            <p style={{ color: "#E2E8F0", fontSize: "16px", lineHeight: "1.6", marginBottom: "32px", fontWeight: 600 }}>
              "You found the secret core! Welcome to the bleeding edge of anatomy exploration." 🚀
            </p>
            <button
              onClick={() => setShowSecretModal(false)}
              style={{ background: "linear-gradient(90deg, #EC4899, #8B5CF6)", border: "none", color: "white", padding: "14px 32px", borderRadius: "16px", fontSize: "16px", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px rgba(236, 72, 153, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              Enter the Matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default Settings;
>>>>>>> b946a2b779de65c76fb35369ee257536cac0d21a
