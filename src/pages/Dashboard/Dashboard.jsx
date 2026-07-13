import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { useGamification } from "../../contexts/GamificationContext";
import { getUserProgress } from "../../services/quizApi";
import { FiHeart, FiActivity, FiTrendingUp, FiCpu, FiCamera, FiRepeat } from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp, level, xpForNextLevel, currentLevelXp, streak, badges, availableBadges } = useGamification();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user?.email) {
      getUserProgress(user.email)
        .then((data) => {
          setProgressData(data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading progress in Dashboard:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Helper to convert date to relative string
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Some time ago";
    try {
      const now = new Date();
      const attempted = new Date(dateStr.replace(' ', 'T'));
      const diffMs = now - attempted;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return "Recently";
    }
  };

  // 1. Calculate Mastery Percentage (defaults to 42% if empty)
  const latestByOrgan = {};
  progressData.forEach((attempt) => {
    const organ = attempt.organ;
    if (!latestByOrgan[organ] || new Date(attempt.attempted_at) > new Date(latestByOrgan[organ].attempted_at)) {
      latestByOrgan[organ] = attempt;
    }
  });
  const organList = ["Heart", "Brain", "Lungs", "Liver"];
  const latestAttempts = Object.values(latestByOrgan);
  const masterySum = latestAttempts.reduce((acc, q) => acc + q.percentage, 0);
  const overallMastery = progressData.length > 0 && latestAttempts.length > 0
    ? Math.round(masterySum / organList.length)
    : 42;

  // 2. Calculate Study Time (defaults to 12.5 hrs if empty)
  const studyHours = progressData.length > 0
    ? (progressData.length * 0.4).toFixed(1)
    : "12.5";

  // 3. Calculate Quizzes Passed (defaults to 8/10 if empty)
  const quizzesPassed = progressData.length > 0
    ? progressData.filter(q => q.percentage >= 60).length
    : 8;
  const quizzesTotal = progressData.length > 0
    ? progressData.length
    : 10;

  // 4. Activity List compilation (falls back to screenshot items if empty/sparse)
  const getTimelineActivities = () => {
    const dynamicActivities = progressData
      .sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at))
      .map((attempt, idx) => {
        const organIcon = attempt.organ === "Heart" ? "🫀" : attempt.organ === "Brain" ? "🧠" : attempt.organ === "Lungs" ? "🫁" : "🧬";
        const organColor = attempt.organ === "Heart" ? "#06B6D4" : attempt.organ === "Brain" ? "#3B82F6" : "#C084FC";
        return {
          id: `dynamic-${idx}`,
          title: `${attempt.organ} Assessment`,
          desc: `Scored ${Math.round(attempt.percentage)}% in Quiz • ${getTimeAgo(attempt.attempted_at)}`,
          type: "score",
          tag: `SCORE ${Math.round(attempt.percentage)}%`,
          icon: organIcon,
          color: organColor
        };
      });

    const defaultActivities = [
      {
        id: "default-1",
        title: "Heart Anatomy Exploration",
        desc: "Viewed 3D Card • 2 hours ago",
        type: "explored",
        tag: "EXPLORED",
        icon: "🫀",
        color: "#06B6D4"
      },
      {
        id: "default-2",
        title: "Brain Anatomy Session",
        desc: "Completed 3D rotation • Yesterday",
        type: "completed",
        tag: "COMPLETED",
        icon: "🧠",
        color: "#3B82F6"
      },
      {
        id: "default-3",
        title: "Cardiovascular Assessment",
        desc: "Scored 85% in Quiz • 3 days ago",
        type: "score",
        tag: "SCORE 85%",
        icon: "🧬",
        color: "#C084FC"
      }
    ];

    // Combine and return first 3 items
    const combined = [...dynamicActivities, ...defaultActivities];
    return combined.slice(0, 3);
  };

  const activities = getTimelineActivities();

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: "rgba(6, 182, 212, 0.08)",
            borderRadius: "50%",
            filter: "blur(150px)",
            top: "-100px",
            right: "-100px",
            pointerEvents: "none",
          }}
        />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="dashboard-layout-new">
          
          {/* Left Panel: Welcome + Feature Grid */}
          <div className="dashboard-left-section">
            
            {/* Welcome Banner Card */}
            <div className="glass-card-new welcome-banner" style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(30, 41, 59, 0.4) 100%)", minHeight: "140px", display: "flex", alignItems: "center" }}>
              <div style={{ zIndex: 5, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(6, 182, 212, 0.12)",
                    border: "1px solid rgba(6, 182, 212, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    boxShadow: "0 0 15px rgba(6, 182, 212, 0.2)"
                  }}>
                    👋
                  </div>
                  <h2 style={{ fontSize: "30px", fontWeight: "800", margin: 0, color: "white", letterSpacing: "-0.5px" }}>
                    Welcome Back, <span style={{
                      background: "linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}>{displayName}</span>
                  </h2>
                </div>
                <p style={{ color: "#94A3B8", fontSize: "15px", margin: 0, fontWeight: "500" }}>
                  Intelligent Medical Visualization & Anatomy Learning Center
                </p>
              </div>

              {/* Decorative Floating Medical Icons */}
              <div style={{ position: "absolute", right: "20px", top: "0", bottom: "0", width: "180px", overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
                <span className="floating-med-icon" style={{ fontSize: "24px", top: "20px", right: "20px", animationDelay: "0s" }}>🧬</span>
                <span className="floating-med-icon" style={{ fontSize: "22px", top: "65px", right: "100px", animationDelay: "1.5s" }}>🧠</span>
                <span className="floating-med-icon" style={{ fontSize: "20px", bottom: "25px", right: "60px", animationDelay: "3s" }}>🫁</span>
                <span className="floating-med-icon" style={{ fontSize: "22px", top: "95px", right: "30px", animationDelay: "4.5s" }}>🫀</span>
              </div>
            </div>

            {/* Feature Cards Grid (3 Columns) */}
            <div className="features-grid-new">
              
              {/* Learn Anatomy */}
              <div
                className="glass-card-new clickable active-cyan"
                onClick={() => navigate("/body-selection")}
              >
                <div className="icon-box-new">
                  <FiHeart style={{ color: "#06B6D4", fontSize: "18px" }} />
                </div>
                <h3 style={{ color: "#06B6D4", marginTop: "18px", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  Learn Anatomy
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                  Explore detailed male and female organ structures in realistic 3D and AR.
                </p>
              </div>

              {/* Interactive Quiz */}
              <div
                className="glass-card-new clickable active-purple"
                onClick={() => navigate("/quiz")}
              >
                <div className="icon-box-new">
                  <FiCpu style={{ color: "#A78BFA", fontSize: "18px" }} />
                </div>
                <h3 style={{ color: "#A78BFA", marginTop: "18px", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  Interactive Quiz
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                  Test your medical knowledge through AI-powered quiz assessments.
                </p>
              </div>

              {/* Progress Tracking */}
              <div
                className="glass-card-new clickable active-pink"
                onClick={() => navigate("/learning-progress")}
              >
                <div className="icon-box-new">
                  <FiTrendingUp style={{ color: "#F472B6", fontSize: "18px" }} />
                </div>
                <h3 style={{ color: "#F472B6", marginTop: "18px", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  Progress Tracking
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                  Track learning milestones, time spent, and review charts.
                </p>
              </div>

              {/* AI Tutor */}
              <div
                className="glass-card-new clickable active-indigo"
                onClick={() => navigate("/ai-tutor")}
              >
                <div className="icon-box-new">
                  <FiCpu style={{ color: "#6366F1", fontSize: "18px" }} />
                </div>
                <h3 style={{ color: "#6366F1", marginTop: "18px", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  AI Tutor
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                  Personalized AI-powered explanations and terminology queries.
                </p>
              </div>

              {/* Organ Recognition (Active) */}
              <div
                className="glass-card-new clickable active-cyan"
                onClick={() => navigate("/organ-recognition")}
              >
                <div className="icon-box-new">
                  <FiCamera style={{ color: "#06B6D4", fontSize: "18px" }} />
                </div>
                <h3 style={{ color: "#06B6D4", marginTop: "18px", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  Organ Recognition
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                  Identify organs from real physical models using AI cameras.
                </p>
              </div>

              {/* Comparison */}
              <div
                className="glass-card-new clickable active-purple"
                onClick={() => navigate("/comparison")}
              >
                <div className="icon-box-new">
                  <FiRepeat style={{ color: "#A78BFA", fontSize: "18px" }} />
                </div>
                <h3 style={{ color: "#A78BFA", marginTop: "18px", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  Comparison
                </h3>
                <p style={{ color: "#CBD5E1", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                  Compare anatomical structures across different body conditions and genders.
                </p>
              </div>

            </div>

          </div>

          {/* Right Panel: Sidebar */}
          <div className="dashboard-right-section">
            
            {/* Gamification Profile Card */}
            <div className="glass-card-new right-card-progress" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "white",
                    boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)"
                  }}>
                    {level}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "white" }}>Level {level}</h3>
                    <div style={{ fontSize: "12px", color: "#94A3B8" }}>{xp} Total XP</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245, 158, 11, 0.1)", padding: "6px 12px", borderRadius: "20px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <span style={{ fontSize: "16px" }}>{streak >= 3 ? "🔥" : "⚡"}</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#F59E0B" }}>{streak} Day Streak</span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#94A3B8" }}>XP to Level {level + 1}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#06B6D4" }}>{currentLevelXp} / 100</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${(currentLevelXp / 100) * 100}%`, height: "100%", background: "linear-gradient(90deg, #06B6D4 0%, #3B82F6 100%)", borderRadius: "4px", transition: "width 1s ease-in-out" }} />
              </div>

              {/* Badges Display */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  Achievements
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {availableBadges.map((badge) => {
                    const isUnlocked = badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        title={badge.description}
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "12px",
                          background: isUnlocked ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                          border: isUnlocked ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          filter: isUnlocked ? "none" : "grayscale(100%) opacity(0.3)",
                          cursor: "help",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {badge.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="glass-card-new right-card-activity">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "18px", color: "#F59E0B" }}>⚡</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "white" }}>
                  Recent Activity
                </h3>
              </div>

              <div className="timeline-new">
                {activities.map((activity) => (
                  <div key={activity.id} className="timeline-item-new">
                    <div style={{
                      position: "absolute",
                      left: "-20px",
                      top: "20px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      border: "2px solid #080c14",
                      boxShadow: `0 0 8px ${activity.color}`,
                      backgroundColor: activity.color,
                      zIndex: 2
                    }} />
                    
                    <div className="timeline-card-new">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px"
                        }}>
                          {activity.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "white" }}>
                            {activity.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                            {activity.desc}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`status-pill ${activity.type}`}>{activity.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Progress Card */}
            <div className="glass-card-new right-card-progress">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ fontSize: "18px", color: "#FBBF24" }}>🏆</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "white" }}>
                  Learning Progress
                </h3>
              </div>

              {/* Anatomy Mastery Slider */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#94A3B8" }}>Anatomy Mastery</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#EC4899" }}>{overallMastery}%</span>
              </div>
              <div className="mastery-progress-bg">
                <div className="mastery-progress-fill" style={{ width: `${overallMastery}%` }} />
              </div>

              {/* Stats Grid */}
              <div className="stat-boxes-container">
                <div className="stat-box-item">
                  <span style={{ fontSize: "20px" }}>⏱️</span>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>Study Time</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginTop: "2px" }}>{studyHours} hrs</div>
                  </div>
                </div>

                <div className="stat-box-item">
                  <span style={{ fontSize: "20px" }}>🏆</span>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quizzes Passed</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginTop: "2px" }}>{quizzesPassed}/{quizzesTotal}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;