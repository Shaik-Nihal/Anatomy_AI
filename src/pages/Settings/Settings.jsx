import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState("cyan");
  const [fontSize, setFontSize] = useState("medium");
  
  // Learning preferences state
  const [dailyGoal, setDailyGoal] = useState("30"); // in minutes
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  
  // Notification state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifResults, setNotifResults] = useState(true);
  const [notifProgress, setNotifProgress] = useState(false);
  
  // System states
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // success | error | info
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({ os: "Unknown OS", browser: "Unknown Browser" });

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

    const storedDarkMode = localStorage.getItem("settings_dark_mode");
    if (storedDarkMode !== null) {
      setIsDarkMode(storedDarkMode === "true");
    }
    
    const storedThemeColor = localStorage.getItem("settings_theme_color");
    if (storedThemeColor) {
      setThemeColor(storedThemeColor);
    }
    
    const storedFontSize = localStorage.getItem("settings_font_size");
    if (storedFontSize) {
      setFontSize(storedFontSize);
    }
    
    const storedDailyGoal = localStorage.getItem("settings_daily_goal");
    if (storedDailyGoal) {
      setDailyGoal(storedDailyGoal);
    }
    
    const storedReminders = localStorage.getItem("settings_reminders_enabled");
    if (storedReminders !== null) {
      setRemindersEnabled(storedReminders === "true");
    }

    const storedNotifEmail = localStorage.getItem("settings_notif_email");
    if (storedNotifEmail !== null) setNotifEmail(storedNotifEmail === "true");

    const storedNotifResults = localStorage.getItem("settings_notif_results");
    if (storedNotifResults !== null) setNotifResults(storedNotifResults === "true");

    const storedNotifProgress = localStorage.getItem("settings_notif_progress");
    if (storedNotifProgress !== null) setNotifProgress(storedNotifProgress === "true");
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
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    style={{ width: "100%", accentColor: "#06B6D4", marginTop: "10px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "11px", marginTop: "4px" }}>
                    <span>10 Min</span>
                    <span>90 Min</span>
                    <span>180 Min</span>
                  </div>
                </div>

                <div className="form-group-new" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Daily Learning Reminders</div>
                    <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Remind me to study daily to preserve my streak.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={remindersEnabled}
                    onChange={(e) => setRemindersEnabled(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "#06B6D4", cursor: "pointer" }}
                  />
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="settings-form-panel">
                <h2 className="panel-title">Notifications</h2>
                <p className="panel-desc">Configure automated mailers and results broadcasts.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Email Notifications</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Receive system notices via email.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.checked)}
                      style={{ width: "20px", height: "20px", accentColor: "#06B6D4", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Quiz Results Alerts</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Broadcasting summaries of finished assessments.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifResults}
                      onChange={(e) => setNotifResults(e.target.checked)}
                      style={{ width: "20px", height: "20px", accentColor: "#06B6D4", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "14px" }}>Progress Updates Notifications</div>
                      <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>Weekly analysis of study time and mastery charts.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifProgress}
                      onChange={(e) => setNotifProgress(e.target.checked)}
                      style={{ width: "20px", height: "20px", accentColor: "#06B6D4", cursor: "pointer" }}
                    />
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
              <div className="settings-form-panel">
                <h2 className="panel-title">About AR AnatomyAI</h2>
                <p className="panel-desc">Application metadata, policies, and documentation links.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "8px", fontSize: "13px" }}>
                    <div style={{ color: "#64748B", fontWeight: 600 }}>App Version:</div>
                    <div style={{ color: "#white" }}>1.2.4 (Stable Build)</div>

                    <div style={{ color: "#64748B", fontWeight: 600 }}>Developer:</div>
                    <div style={{ color: "#white" }}>Google DeepMind Advanced Engineering</div>

                    <div style={{ color: "#64748B", fontWeight: 600 }}>Engine:</div>
                    <div style={{ color: "#white" }}>React 19 + ThreeJS / Fiber</div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", gap: "20px" }}>
                    <a href="#terms" onClick={(e) => { e.preventDefault(); showToast("Showing Terms & Conditions.", "info"); }} style={{ color: "#06B6D4", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>
                      Terms & Conditions
                    </a>
                    <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast("Displaying Privacy Policy.", "info"); }} style={{ color: "#06B6D4", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>
                      Privacy Policy
                    </a>
                  </div>
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
