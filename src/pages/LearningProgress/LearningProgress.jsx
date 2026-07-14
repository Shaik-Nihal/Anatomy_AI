import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "../../components/Navbar";
import { getUserProgress } from "../../services/quizApi";
import { useAuth } from "../../contexts/AuthContext";
import "./LearningProgress.css";

// ─── Small reusable components ───────────────────────────────────────────────

function CircularProgress({ value }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
      <circle
        cx="55" cy="55" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
      />
      <text x="55" y="61" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">
        {value}%
      </text>
    </svg>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 70 ? "#eab308" : "#ef4444";
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: "2px 10px",
      fontSize: 13,
      fontWeight: 700,
    }}>
      {score}%
    </span>
  );
}

// ─── Inline styles helpers ────────────────────────────────────────────────────

const card = {
  background: "#111827",
  borderRadius: 12,
  border: "1px solid #1e293b",
  padding: "18px 20px",
};

const btn = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "#cbd5e1",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// ─── Main component ──────────────────────────────────────────────────────────

function LearningProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const email = user?.email || "temp_user";

  useEffect(() => {
    getUserProgress(email)
      .then((data) => {
        setProgressData(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading progress:", err);
        setError(err);
        setLoading(false);
      });
  }, [email]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0f1a", color: "#e2e8f0" }}>
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 80px)", flexDirection: "column" }}>
          <div style={{
            width: 50,
            height: 50,
            border: "4px solid rgba(255,255,255,0.15)",
            borderTop: "4px solid #06B6D4",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} className="spinner"></div>
          <p style={{ color: "#06B6D4", marginTop: 16, fontWeight: 600 }}>Loading progress metrics...</p>
        </div>
      </div>
    );
  }

  // ─── CALCULATE DYNAMIC METRICS ───────────────────────────────────────────────
  const quizzesCompleted = progressData.length;
  const averageAccuracy = quizzesCompleted > 0 
    ? Math.round(progressData.reduce((acc, q) => acc + q.percentage, 0) / quizzesCompleted)
    : 0;

  // Streak calculation
  let studyStreak = 0;
  if (quizzesCompleted > 0) {
    const dates = progressData.map(q => {
      if (!q.attempted_at) return "";
      return q.attempted_at.split(' ')[0] || q.attempted_at.split('T')[0];
    }).filter(d => d);
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        studyStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const current = new Date(uniqueDates[i]);
          const next = new Date(uniqueDates[i+1]);
          const diffDays = Math.ceil(Math.abs(current - next) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            studyStreak++;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
    }
  }

  // Total Study Time Calculation (Simulated at ~7 minutes per completed quiz)
  const totalMinutes = quizzesCompleted * 7;
  const studyHours = Math.floor(totalMinutes / 60);
  const studyMinutes = totalMinutes % 60;
  const studyTimeStr = studyHours > 0 ? `${studyHours}h ${studyMinutes}m` : `${studyMinutes}m`;

  // Organ dynamic scores
  const latestByOrgan = {};
  progressData.forEach((attempt) => {
    const organ = attempt.organ;
    if (!latestByOrgan[organ] || new Date(attempt.attempted_at) > new Date(latestByOrgan[organ].attempted_at)) {
      latestByOrgan[organ] = attempt;
    }
  });

  const organList = ["Heart", "Brain", "Lungs", "Liver", "Kidney", "Stomach", "Intestines", "Human Anatomy", "Skeleton", "Skull", "Eye"];
  const latestAttempts = Object.values(latestByOrgan);
  const masterySum = latestAttempts.reduce((acc, q) => acc + q.percentage, 0);
  const overallMastery = latestAttempts.length > 0 ? Math.round(masterySum / organList.length) : 0;

  // Chart data
  const masteryData = [...progressData]
    .sort((a, b) => new Date(a.attempted_at) - new Date(b.attempted_at))
    .map((attempt) => {
      const dateObj = new Date(attempt.attempted_at);
      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        date: dateStr,
        value: Math.round(attempt.percentage),
      };
    });

  // Topics list
  const topicData = [
    { name: "Heart",  icon: "🫀",  pct: latestByOrgan["Heart"] ? Math.round(latestByOrgan["Heart"].percentage) : 0, color: "#ef4444" },
    { name: "Brain",  icon: "🧠",  pct: latestByOrgan["Brain"] ? Math.round(latestByOrgan["Brain"].percentage) : 0, color: "#a78bfa" },
    { name: "Lungs",  icon: "🫁",  pct: latestByOrgan["Lungs"] ? Math.round(latestByOrgan["Lungs"].percentage) : 0, color: "#06b6d4" },
    { name: "Liver",  icon: "/icons/liver.png",  pct: latestByOrgan["Liver"] ? Math.round(latestByOrgan["Liver"].percentage) : 0, color: "#f97316" },
    { name: "Kidney", icon: "/icons/kidney.png", pct: latestByOrgan["Kidney"] ? Math.round(latestByOrgan["Kidney"].percentage) : 0, color: "#ef4444" },
    { name: "Stomach",icon: "/icons/stomach.png",pct: latestByOrgan["Stomach"] ? Math.round(latestByOrgan["Stomach"].percentage) : 0, color: "#10b981" },
    { name: "Intestines",icon:"/icons/intestines.png",pct: latestByOrgan["Intestines"] ? Math.round(latestByOrgan["Intestines"].percentage) : 0, color: "#a78bfa" },
    { name: "Human Anatomy", icon: "/icons/human.png", pct: latestByOrgan["Human Anatomy"] ? Math.round(latestByOrgan["Human Anatomy"].percentage) : 0, color: "#3b82f6" },
    { name: "Skeleton", icon: "🦴", pct: latestByOrgan["Skeleton"] ? Math.round(latestByOrgan["Skeleton"].percentage) : 0, color: "#f1f5f9" },
    { name: "Skull", icon: "💀", pct: latestByOrgan["Skull"] ? Math.round(latestByOrgan["Skull"].percentage) : 0, color: "#cbd5e1" },
    { name: "Eye", icon: "👁️", pct: latestByOrgan["Eye"] ? Math.round(latestByOrgan["Eye"].percentage) : 0, color: "#38bdf8" },
  ];

  // Recent Quizzes list
  const recentQuizzes = [...progressData]
    .sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at))
    .slice(0, 4)
    .map((q) => {
      const dateObj = new Date(q.attempted_at);
      const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return {
        name: `${q.organ} (${q.difficulty})`,
        score: Math.round(q.percentage),
        time: `${q.score}/${q.total_questions}`,
        date: dateStr
      };
    });

  // Strengths & Weaknesses Pie Calculation
  const strengthsList = [];
  const weaknessesList = [];
  
  organList.forEach(orgName => {
    const latest = latestByOrgan[orgName];
    if (latest) {
      if (latest.percentage >= 75) {
        strengthsList.push(orgName);
      } else {
        weaknessesList.push(orgName);
      }
    }
  });
  
  const strengthsCount = strengthsList.length;
  const weaknessesCount = weaknessesList.length;
  const remainingCount = organList.length - (strengthsCount + weaknessesCount);

  const donutData = [
    { name: "Strengths",  value: strengthsCount, color: "#06b6d4" },
    { name: "Weaknesses", value: weaknessesCount, color: "#7c3aed" },
    { name: "Remaining",  value: remainingCount, color: "#1e293b" },
  ];

  // Insights Calculations
  let preferredTopic = "None yet";
  let maxCount = 0;
  const counts = {};
  progressData.forEach(q => counts[q.organ] = (counts[q.organ] || 0) + 1);
  Object.entries(counts).forEach(([org, count]) => {
    if (count > maxCount) {
      maxCount = count;
      preferredTopic = org + " Anatomy";
    }
  });

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayCounts = {};
  progressData.forEach(q => {
    const day = new Date(q.attempted_at).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  let activeDayIndex = -1;
  let maxDayCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      activeDayIndex = parseInt(day);
    }
  });
  const mostActiveDay = activeDayIndex !== -1 ? days[activeDayIndex] : "No data";

  const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  progressData.forEach(q => {
    const hour = new Date(q.attempted_at).getHours();
    if (hour >= 6 && hour < 12) hourCounts.morning++;
    else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
    else if (hour >= 17 && hour < 22) hourCounts.evening++;
    else hourCounts.night++;
  });
  let bestTime = "No data";
  let maxHourCount = 0;
  if (hourCounts.morning > maxHourCount) { bestTime = "Morning (6 AM - 12 PM)"; maxHourCount = hourCounts.morning; }
  if (hourCounts.afternoon > maxHourCount) { bestTime = "Afternoon (12 PM - 5 PM)"; maxHourCount = hourCounts.afternoon; }
  if (hourCounts.evening > maxHourCount) { bestTime = "Evening (5 PM - 10 PM)"; maxHourCount = hourCounts.evening; }
  if (hourCounts.night > maxHourCount) { bestTime = "Night (10 PM - 6 AM)"; }

  let performanceTrend = "Stable";
  if (quizzesCompleted >= 2) {
    const mid = Math.floor(quizzesCompleted / 2);
    const sorted = [...progressData].sort((a, b) => new Date(a.attempted_at) - new Date(b.attempted_at));
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);
    const firstAvg = firstHalf.reduce((acc, q) => acc + q.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, q) => acc + q.percentage, 0) / secondHalf.length;
    if (secondAvg - firstAvg > 3) performanceTrend = "Improving 📈";
    else if (firstAvg - secondAvg > 3) performanceTrend = "Needs Practice 📉";
  }

  const statCards = [
    {
      icon: "👥", iconBg: "#7c3aed",
      label: "Quizzes Completed",
      value: String(quizzesCompleted),
      sub: quizzesCompleted > 0 ? "Keep it up!" : "No attempts yet",
      subColor: "#22c55e",
    },
    {
      icon: "📊", iconBg: "#f59e0b",
      label: "Average Score",
      value: `${averageAccuracy}%`,
      sub: averageAccuracy >= 75 ? "Excellent accuracy!" : averageAccuracy > 0 ? "Practice to improve" : "Start your first quiz",
      subColor: "#22c55e",
    },
    {
      icon: "🔥", iconBg: "#f97316",
      label: "Study Streak",
      value: `${studyStreak} ${studyStreak === 1 ? "day" : "days"}`,
      sub: studyStreak > 0 ? "🔥 You're on fire!" : "Study daily for streak",
      subColor: "#f97316",
    },
    {
      icon: "⏱", iconBg: "#06b6d4",
      label: "Total Study Time",
      value: studyTimeStr,
      sub: quizzesCompleted > 0 ? "Keep growing your hours" : "0 hours recorded",
      subColor: "#06b6d4",
    },
  ];

  const insights = [
    { icon: "🕐", iconColor: "#f59e0b", label: "Best Time to Study",       value: bestTime },
    { icon: "📅", iconColor: "#06b6d4", label: "Most Active Day",           value: mostActiveDay },
    { icon: "📈", iconColor: "#22c55e", label: "Quiz Performance Trend",    value: performanceTrend },
    { icon: "❤️", iconColor: "#ef4444", label: "Preferred Topic",           value: preferredTopic },
  ];

  return (
    <div className="dashboard-container" style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      fontSize: 14,
    }}>
      <Navbar />

      <main className="dashboard-content" style={{ flex: 1, padding: "32px 40px" }}>
        
        {/* ── EMPTY STATE IF NO QUIZZES YET ── */}
        {quizzesCompleted === 0 ? (
          <div className="glass-card-new" style={{
            padding: "60px 40px",
            textAlign: "center",
            maxWidth: "680px",
            margin: "40px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(6,182,212,0.05)",
            border: "1px solid rgba(6,182,212,0.15)"
          }}>
            <span style={{ fontSize: "70px", marginBottom: "20px" }}>🧠</span>
            <h2 style={{ color: "#fff", fontSize: "24px", marginBottom: "15px", fontWeight: "700" }}>No Quiz Progress Found</h2>
            <p style={{ color: "#94A3B8", fontSize: "16px", lineHeight: "1.6", marginBottom: "30px", maxWidth: "500px" }}>
              It looks like you haven't taken any medical anatomy quizzes yet. Complete a quiz to see your performance metrics, mastery level over time, strengths & weaknesses, and personalized insights!
            </p>
            <button
              onClick={() => navigate("/quiz")}
              style={{
                padding: "14px 35px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #06B6D4, #2563EB)",
                color: "white",
                border: "none",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(6, 182, 212, 0.4)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
            >
              🚀 Take Your First Quiz
            </button>
          </div>
        ) : (
          <>
            {/* ── Row 1: Stats ── */}
            <div className="progress-container-grid">
              {/* Overall Mastery */}
              <div className="glass-card-new active-cyan" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                  Overall Mastery
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <CircularProgress value={overallMastery} />
                  <div>
                    <div style={{ color: "#06b6d4", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      {overallMastery >= 85 ? "Expert" : overallMastery >= 60 ? "Intermediate" : "Beginner"}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 11, lineHeight: 1.6 }}>
                      {overallMastery >= 85 ? "Superb work! Maintain this high level." : "Keep practicing! You are getting closer."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              {statCards.map((s) => (
                <div key={s.label} className={`glass-card-new ${s.label === "Study Streak" ? "active-pink" : s.label === "Average Score" ? "active-purple" : "active-indigo"}`} style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{s.label}</span>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: s.iconBg + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>{s.icon}</div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: s.subColor }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Row 2: Charts ── */}
            <div className="progress-charts-grid">

              {/* Mastery Over Time */}
              <div className="glass-card-new active-cyan">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Mastery Over Time</span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>Performance Score</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={masteryData}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#475569", fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fill: "#475569", fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b", border: "1px solid #334155",
                        borderRadius: 8, color: "#e2e8f0", fontSize: 12,
                      }}
                      formatter={(v) => [`${v}%`, "Mastery"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="url(#lineGrad)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#06b6d4", stroke: "#0b0f1a", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#7c3aed" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Topic Mastery */}
              <div className="glass-card-new active-purple">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Topic Mastery</span>
                  <span style={{ color: "#06b6d4", fontSize: 12 }}>4 Main Organs</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {topicData.map((t) => (
                    <div key={t.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>
                            {t.icon.includes(".png") ? <img src={t.icon} alt={t.name} style={{ width: "20px", height: "20px", objectFit: "contain" }} /> : t.icon}
                          </span>
                          <span style={{ color: "#cbd5e1", fontSize: 13 }}>{t.name}</span>
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>{t.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${t.pct}%`, height: "100%",
                          background: t.color, borderRadius: 4,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Row 3: Quizzes / Donut / Milestone ── */}
            <div className="progress-details-grid">

              {/* Recent Quizzes */}
              <div className="glass-card-new active-indigo">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Recent Quizzes</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>Latest attempts</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Quiz Name", "Accuracy", "Questions Solved", "Date"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left", color: "#475569",
                          fontSize: 11, fontWeight: 600,
                          paddingBottom: 8,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuizzes.map((q, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "10px 0 0", color: "#cbd5e1", fontSize: 13 }}>{q.name}</td>
                        <td style={{ padding: "10px 0 0" }}><ScoreBadge score={q.score} /></td>
                        <td style={{ padding: "10px 0 0", color: "#64748b", fontSize: 13 }}>{q.time}</td>
                        <td style={{ padding: "10px 0 0", color: "#64748b", fontSize: 13 }}>{q.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="glass-card-new active-cyan" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, color: "#e2e8f0", alignSelf: "flex-start", marginBottom: 12 }}>
                  Strengths & Weaknesses
                </span>
                <PieChart width={130} height={130}>
                  <Pie
                    data={donutData}
                    cx={65} cy={65}
                    innerRadius={42} outerRadius={60}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 8 }}>
                  {[
                    { color: "#06b6d4", label: `Strengths (${strengthsCount})`,  sub: strengthsList.length > 0 ? strengthsList.join(", ") : "None yet (>=75%)" },
                    { color: "#7c3aed", label: `Weaknesses (${weaknessesCount})`, sub: weaknessesList.length > 0 ? weaknessesList.join(", ") : "None yet (<75%)" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{item.label}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Milestone */}
              <div
                className="glass-card-new active-pink"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 320
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#e2e8f0",
                    marginBottom: 10,
                  }}
                >
                  Next Milestone
                </span>

                <PieChart width={160} height={160}>
                  <Pie
                    data={[
                      { name: "Completed", value: overallMastery },
                      { name: "Remaining", value: 100 - overallMastery },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#06b6d4" />
                    <Cell fill="#1e293b" />
                  </Pie>

                  <text
                    x="80"
                    y="75"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="22"
                    fontWeight="bold"
                  >
                    {overallMastery}%
                  </text>

                  <text
                    x="80"
                    y="95"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    Mastery
                  </text>
                </PieChart>

                <div
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  {overallMastery >= 80 ? "Mastery Achieved!" : "Reach 80% Overall Mastery"}
                </div>

                <div
                  style={{
                    color: "#06b6d4",
                    fontWeight: 600,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {overallMastery >= 80 ? "Goal met! 🎉" : `${80 - overallMastery > 0 ? 80 - overallMastery : 0}% Remaining`}
                </div>
              </div>
            </div>

            {/* ── Row 4: Study Insights ── */}
            <div className="glass-card-new active-purple progress-insights-grid" style={{ gridColumn: "1 / -1", padding: "28px" }}>
              <div style={{ gridColumn: "1 / -1", fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>
                Study Insights
              </div>
              {insights.map((ins) => (
                <div key={ins.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: ins.iconColor + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>{ins.icon}</div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 11, marginBottom: 3 }}>{ins.label}</div>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{ins.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default LearningProgress;
