import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { useGamification } from "../../contexts/GamificationContext";
import { getUserProgress } from "../../services/quizApi";
import { FiHeart, FiActivity, FiTrendingUp, FiCpu, FiCamera, FiRepeat } from "react-icons/fi";
import { comparisonData } from "../../data/comparisonData";
import "./Dashboard.css";

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
  const organList = Object.keys(comparisonData);
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
        const organIcon = comparisonData[attempt.organ]?.icon || "🧬";
        const organColor = comparisonData[attempt.organ]?.color || "#C084FC";
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
        icon: comparisonData["Heart"]?.icon || "🫀",
        color: "#06B6D4"
      },
      {
        id: "default-2",
        title: "Brain Anatomy Session",
        desc: "Completed 3D rotation • Yesterday",
        type: "completed",
        tag: "COMPLETED",
        icon: comparisonData["Brain"]?.icon || "🧠",
        color: "#3B82F6"
      },
      {
        id: "default-3",
        title: "Liver Assessment",
        desc: "Scored 85% in Quiz • 3 days ago",
        type: "score",
        tag: "SCORE 85%",
        icon: comparisonData["Liver"]?.icon || "🧬",
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
        <div className="dashboard-glow" />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="dashboard-layout-new">
          
          {/* Left Panel: Welcome + Feature Grid */}
          <div className="dashboard-left-section">
            
            {/* Welcome Banner Card */}
            <div className="glass-card-new welcome-banner">
              <div className="relative z-10 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    👋
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold m-0 text-white tracking-tight">
                    Welcome Back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{displayName}</span>
                  </h2>
                </div>
                <p className="text-slate-400 text-sm sm:text-base m-0 font-medium">
                  Intelligent Medical Visualization & Anatomy Learning Center
                </p>
              </div>

              {/* Decorative Floating Medical Icons */}
              <div className="absolute right-0 top-0 bottom-0 w-48 overflow-hidden pointer-events-none z-0 hidden sm:block">
                <span className="floating-med-icon text-2xl top-5 right-5" style={{ animationDelay: "0s" }}>🧬</span>
                <span className="floating-med-icon text-2xl top-16 right-24" style={{ animationDelay: "1.5s" }}>🧠</span>
                <span className="floating-med-icon text-xl bottom-6 right-16" style={{ animationDelay: "3s" }}>🫁</span>
                <span className="floating-med-icon text-2xl top-24 right-8" style={{ animationDelay: "4.5s" }}>🫀</span>
              </div>
            </div>

            {/* Feature Cards Grid (3 Columns) */}
            <div className="features-grid-new">
              
              {/* Learn Anatomy */}
              <div
                className="glass-card-new clickable active-cyan"
                onClick={() => navigate("/body-selection")}
              >
                <div className="icon-box-new text-cyan-500 text-lg">
                  <FiHeart />
                </div>
                <h3 className="text-cyan-500 mt-4 text-xl font-bold mb-2">
                  Learn Anatomy
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed m-0">
                  Explore detailed male and female organ structures in realistic 3D and AR.
                </p>
              </div>

              {/* Interactive Quiz */}
              <div
                className="glass-card-new clickable active-purple"
                onClick={() => navigate("/quiz")}
              >
                <div className="icon-box-new text-purple-400 text-lg">
                  <FiCpu />
                </div>
                <h3 className="text-purple-400 mt-4 text-xl font-bold mb-2">
                  Interactive Quiz
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed m-0">
                  Test your medical knowledge through AI-powered quiz assessments.
                </p>
              </div>

              {/* Progress Tracking */}
              <div
                className="glass-card-new clickable active-pink"
                onClick={() => navigate("/learning-progress")}
              >
                <div className="icon-box-new text-pink-400 text-lg">
                  <FiTrendingUp />
                </div>
                <h3 className="text-pink-400 mt-4 text-xl font-bold mb-2">
                  Progress Tracking
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed m-0">
                  Track learning milestones, time spent, and review charts.
                </p>
              </div>

              {/* AI Tutor */}
              <div
                className="glass-card-new clickable active-indigo"
                onClick={() => navigate("/ai-tutor")}
              >
                <div className="icon-box-new text-indigo-400 text-lg">
                  <FiCpu />
                </div>
                <h3 className="text-indigo-400 mt-4 text-xl font-bold mb-2">
                  AI Tutor
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed m-0">
                  Personalized AI-powered explanations and terminology queries.
                </p>
              </div>

              {/* Organ Recognition (Active) */}
              <div
                className="glass-card-new clickable active-cyan"
                onClick={() => navigate("/organ-recognition")}
              >
                <div className="icon-box-new text-cyan-500 text-lg">
                  <FiCamera />
                </div>
                <h3 className="text-cyan-500 mt-4 text-xl font-bold mb-2">
                  Organ Recognition
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed m-0">
                  Identify organs from real physical models using AI cameras.
                </p>
              </div>

              {/* Comparison */}
              <div
                className="glass-card-new clickable active-purple"
                onClick={() => navigate("/comparison")}
              >
                <div className="icon-box-new text-purple-400 text-lg">
                  <FiRepeat />
                </div>
                <h3 className="text-purple-400 mt-4 text-xl font-bold mb-2">
                  Comparison
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed m-0">
                  Compare anatomical structures across different body conditions and genders.
                </p>
              </div>

            </div>

          </div>

          {/* Right Panel: Sidebar */}
          <div className="dashboard-right-section">
            
            {/* Gamification Profile Card */}
            <div className="glass-card-new mb-5">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl font-extrabold text-white shadow-[0_4px_15px_rgba(6,182,212,0.3)]">
                    {level}
                  </div>
                  <div>
                    <h3 className="text-base font-bold m-0 text-white">Level {level}</h3>
                    <div className="text-xs text-slate-400">{xp} Total XP</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                  <span className="text-base">{streak >= 3 ? "🔥" : "⚡"}</span>
                  <span className="text-sm font-extrabold text-amber-500">{streak} Day Streak</span>
                </div>
              </div>

              {/* XP Progress Group */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">XP to Level {level + 1}</span>
                  <span className="text-xs font-bold text-cyan-500">{currentLevelXp} / 100</span>
                </div>
                <div className="w-full h-2 min-h-[8px] flex-shrink-0 bg-white/10 rounded-md overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${(currentLevelXp / 100) * 100}%` }} />
                </div>
              </div>

              {/* Badges Display */}
              <div className="mt-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Achievements
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {availableBadges.map((badge) => {
                    const isUnlocked = badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        title={badge.description}
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center text-2xl cursor-help transition-all duration-300 ${isUnlocked ? 'bg-white/5 border-white/20' : 'bg-white/5 border-white/5 grayscale opacity-30'}`}
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg text-amber-500">⚡</span>
                <h3 className="text-lg font-bold m-0 text-white">
                  Recent Activity
                </h3>
              </div>

              <div className="timeline-new">
                {activities.map((activity) => (
                  <div key={activity.id} className="timeline-item-new">
                    <div 
                      className="timeline-dot-new border-2 border-slate-900 z-10"
                      style={{ 
                        boxShadow: `0 0 8px ${activity.color}`,
                        backgroundColor: activity.color
                      }} 
                    />
                    
                    <div className="timeline-card-new">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-base shrink-0">
                          {activity.icon?.includes(".png") ? <img src={activity.icon} alt="icon" className="w-6 h-6 object-contain" /> : activity.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {activity.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {activity.desc}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 flex shrink-0">
                        <span className={`status-pill ${activity.type}`}>{activity.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Progress Card */}
            <div className="glass-card-new right-card-progress mt-6 lg:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-lg text-amber-400">🏆</span>
                <h3 className="text-lg font-bold m-0 text-white">
                  Learning Progress
                </h3>
              </div>

              {/* Anatomy Mastery Group */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-400">Anatomy Mastery</span>
                  <span className="text-lg font-extrabold text-pink-500">{overallMastery}%</span>
                </div>
                <div className="mastery-progress-bg">
                  <div className="mastery-progress-fill" style={{ width: `${overallMastery}%` }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stat-boxes-container">
                <div className="stat-box-item">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Study Time</div>
                    <div className="text-sm font-bold text-white mt-0.5">{studyHours} hrs</div>
                  </div>
                </div>

                <div className="stat-box-item">
                  <span className="text-xl">🏆</span>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quizzes Passed</div>
                    <div className="text-sm font-bold text-white mt-0.5">{quizzesPassed}/{quizzesTotal}</div>
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