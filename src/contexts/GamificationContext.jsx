import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../services/supabase";

const GamificationContext = createContext();

export const useGamification = () => {
  return useContext(GamificationContext);
};

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.email || "temp_user";

  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);
  const [badges, setBadges] = useState([]);
  const [levelUpAlert, setLevelUpAlert] = useState(false);

  // Level formula: Level 1 starts at 0 XP. Every 100 XP is a level.
  const level = Math.floor(xp / 100) + 1;
  const xpForNextLevel = level * 100;
  const currentLevelXp = xp % 100;

  // Available Badges System
  const availableBadges = [
    { id: "first_quiz", name: "First Steps", description: "Completed your first quiz.", icon: "🎓" },
    { id: "streak_3", name: "Consistency", description: "Reached a 3-day streak.", icon: "🔥" },
    { id: "tutor_chat", name: "Curious Mind", description: "Asked the AI Tutor a question.", icon: "🤖" },
    { id: "vision_label", name: "Keen Eye", description: "Labeled an anatomical diagram.", icon: "👁️" },
    { id: "level_5", name: "Scholar", description: "Reached Level 5.", icon: "🏆" }
  ];

  const [loading, setLoading] = useState(true);

  // Helper to save updates to Supabase
  const saveToSupabase = async (newXp, newStreak, newActiveDate, newBadges) => {
    if (!userId || userId === "temp_user") return;
    try {
      const { error } = await supabase
        .from('gamification_profiles')
        .upsert({
          user_id: userId,
          xp: newXp,
          streak: newStreak,
          last_active_date: newActiveDate,
          badges: newBadges
        });
      if (error) console.error("Error saving gamification profile to Supabase:", error);
    } catch (err) {
      console.error("Failed to save gamification profile:", err);
    }
  };

  useEffect(() => {
    if (!userId || userId === "temp_user") {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('gamification_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        const today = new Date().toISOString().split("T")[0];

        if (error && error.code === 'PGRST116') {
          // Row not found, create new profile
          const initialProfile = {
            user_id: userId,
            xp: 0,
            streak: 1,
            last_active_date: today,
            badges: []
          };
          
          await supabase.from('gamification_profiles').insert([initialProfile]);
          setXp(0);
          setStreak(1);
          setLastActiveDate(today);
          setBadges([]);
        } else if (data) {
          setXp(data.xp || 0);
          setBadges(data.badges || []);
          
          // Handle Streak logic
          const lastActive = data.last_active_date;
          if (lastActive) {
            const lastDate = new Date(lastActive);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let finalStreak = data.streak || 0;
            let finalActiveDate = lastActive;

            if (diffDays === 1) {
              finalStreak += 1;
              finalActiveDate = today;
              await supabase.from('gamification_profiles').update({ streak: finalStreak, last_active_date: today }).eq('user_id', userId);
            } else if (diffDays > 1) {
              finalStreak = 1;
              finalActiveDate = today;
              await supabase.from('gamification_profiles').update({ streak: 1, last_active_date: today }).eq('user_id', userId);
            }
            
            setStreak(finalStreak);
            setLastActiveDate(finalActiveDate);
          } else {
            setStreak(1);
            setLastActiveDate(today);
            await supabase.from('gamification_profiles').update({ streak: 1, last_active_date: today }).eq('user_id', userId);
          }
        }
      } catch (e) {
        console.error("Error loading gamification profile:", e);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const awardBadge = async (badgeId) => {
    setBadges((prev) => {
      if (!prev.includes(badgeId)) {
        const nextBadges = [...prev, badgeId];
        saveToSupabase(xp, streak, lastActiveDate, nextBadges);
        return nextBadges;
      }
      return prev;
    });
  };

  const addXP = async (amount, reason) => {
    setXp((prevXp) => {
      const newXp = prevXp + amount;
      const oldLevel = Math.floor(prevXp / 100) + 1;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      if (newLevel > oldLevel) {
        setLevelUpAlert(true);
        setTimeout(() => setLevelUpAlert(false), 4000);
      }
      
      let updatedBadges = [...badges];
      if (newLevel >= 5 && !updatedBadges.includes("level_5")) {
        updatedBadges.push("level_5");
        setBadges(updatedBadges);
      }
      
      saveToSupabase(newXp, streak, lastActiveDate, updatedBadges);
      return newXp;
    });
  };

  // Check 3-day streak badge
  useEffect(() => {
    if (streak >= 3) {
      awardBadge("streak_3");
    }
  }, [streak]);

  const value = {
    xp,
    level,
    xpForNextLevel,
    currentLevelXp,
    streak,
    badges,
    availableBadges,
    levelUpAlert,
    addXP,
    awardBadge
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
      {/* Level Up Toast Notification */}
      {levelUpAlert && (
        <div style={{
          position: "fixed",
          bottom: "40px",
          right: "40px",
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "white",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 9999,
          animation: "slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ fontSize: "28px" }}>🎉</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>Level Up!</div>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>You reached Level {level}!</div>
          </div>
        </div>
      )}
    </GamificationContext.Provider>
  );
};
