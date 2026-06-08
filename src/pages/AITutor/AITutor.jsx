import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import { sendTutorQuestion, getTutorProgress } from "../../services/quizApi";
import { useAuth } from "../../contexts/AuthContext";

function AITutor() {
  const [activeTab, setActiveTab] = useState("tutor");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const { user } = useAuth();

  // Speech Recognition states & ref
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const userId = user?.email || "temp_user";

  // Chat History & Multiple Conversations states
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Voice tab states
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Type a question and click Explain.");
  const [voiceLoading, setVoiceLoading] = useState(false);

  // Progress tab states
  const [progressData, setProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");

  // Load chat history from localStorage on mount or when userId changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = localStorage.getItem(`anatomy_ai_tutor_history_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
          setChatMessages(parsed[0].messages);
        } else {
          setCurrentChatId(null);
          setChatMessages([
            { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
          ]);
        }
      } catch (err) {
        console.error("Failed to parse chat history", err);
      }
    } else {
      setConversations([]);
      setCurrentChatId(null);
      setChatMessages([
        { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
      ]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [userId]);

  // Voice recognition cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Fetch tutor progress dynamically
  useEffect(() => {
    if (activeTab === "progress") {
      setProgressLoading(true);
      setProgressError("");
      getTutorProgress(userId)
        .then((data) => {
          setProgressData(data);
          setProgressLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setProgressError("Unable to load tutor progress.");
          setProgressLoading(false);
        });
    }
  }, [activeTab, userId]);

  const handleNewConversation = () => {
    setCurrentChatId(null);
    setChatMessages([
      { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
    ]);
    setChatInput("");
  };

  const handleSelectConversation = (id) => {
    const chat = conversations.find((c) => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setChatMessages(chat.messages);
      setActiveTab("tutor");
    }
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem(`anatomy_ai_tutor_history_${userId}`, JSON.stringify(next));
      return next;
    });
    if (currentChatId === id) {
      handleNewConversation();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-US";
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const newUserMsg = { role: "user", text: query };
    setChatInput("");
    setChatLoading(true);

    let activeId = currentChatId;
    let baseMessages = [];

    if (!activeId) {
      // Create new conversation
      const newId = Date.now().toString();
      const newTitle = query.length > 25 ? query.substring(0, 25) + "..." : query;
      const initialGreeting = { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." };
      baseMessages = [initialGreeting, newUserMsg];

      const newChat = {
        id: newId,
        title: newTitle,
        messages: baseMessages
      };

      setCurrentChatId(newId);
      setChatMessages(baseMessages);
      setConversations((prev) => {
        const next = [newChat, ...prev];
        localStorage.setItem(`anatomy_ai_tutor_history_${userId}`, JSON.stringify(next));
        return next;
      });
      activeId = newId;
    } else {
      // Append user message
      baseMessages = [...chatMessages, newUserMsg];
      setChatMessages(baseMessages);
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === activeId ? { ...c, messages: baseMessages } : c));
        localStorage.setItem(`anatomy_ai_tutor_history_${userId}`, JSON.stringify(next));
        return next;
      });
    }

    try {
      const res = await sendTutorQuestion(query);
      const assistantMsg = { role: "assistant", text: res.answer };
      const finalMessages = [...baseMessages, assistantMsg];

      setChatMessages(finalMessages);
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === activeId ? { ...c, messages: finalMessages } : c));
        localStorage.setItem(`anatomy_ai_tutor_history_${userId}`, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error(err);
      const errMsg = { role: "assistant", text: "I'm sorry, I was unable to retrieve an explanation. Please make sure the backend server is running." };
      const finalMessages = [...baseMessages, errMsg];

      setChatMessages(finalMessages);
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === activeId ? { ...c, messages: finalMessages } : c));
        localStorage.setItem(`anatomy_ai_tutor_history_${userId}`, JSON.stringify(next));
        return next;
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleVoiceExplain = async () => {
    if (!voiceInput.trim()) {
      setVoiceStatus("Please write a question first.");
      return;
    }

    setVoiceLoading(true);
    setVoiceStatus("Analyzing and explaining...");

    try {
      const res = await sendTutorQuestion(voiceInput.trim());
      setVoiceAnswer(res.answer);
      setVoiceStatus("Here is the spoken-friendly explanation.");
    } catch (err) {
      console.error(err);
      setVoiceStatus("Unable to fetch explanation. Check backend server.");
    } finally {
      setVoiceLoading(false);
    }
  };

  const renderMessageText = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split("**");
      const renderedLine = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return (
            <strong
              key={partIdx}
              style={{
                fontWeight: "800",
                color: "#FFFFFF",
                fontSize: "15px"
              }}
            >
              {part}
            </strong>
          );
        }
        return part;
      });

      return (
        <div key={lineIdx} style={{ minHeight: "1.2em" }}>
          {renderedLine}
        </div>
      );
    });
  };

  const suggestTopic = (topicQuestion) => {
    setChatInput(topicQuestion);
  };

  // Layout Styles
  const tabBtnStyle = (isActive) => ({
    width: "100%",
    padding: "14px 18px",
    background: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
    border: "1px solid " + (isActive ? "#06B6D4" : "rgba(255, 255, 255, 0.05)"),
    borderRadius: "14px",
    color: isActive ? "#06B6D4" : "#94A3B8",
    fontSize: "15px",
    fontWeight: "600",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  });

  const cardStyle = {
    background: "rgba(30, 41, 59, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    borderRadius: "22px",
    padding: "30px",
    color: "white",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Navbar />

      {/* Main layout grid */}
      <div className="tutor-grid">
        {/* Left Sidebar */}
        <aside className="tutor-sidebar" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "14px", marginBottom: "15px", paddingLeft: "8px", fontWeight: "700", letterSpacing: "0.5px" }}>
              TUTOR SECTIONS
            </h3>
            <button style={tabBtnStyle(activeTab === "tutor")} onClick={() => setActiveTab("tutor")}>
              💬 Chat Tutor
            </button>
            <button style={tabBtnStyle(activeTab === "voice")} onClick={() => setActiveTab("voice")}>
              🎙️ Voice AI Tutor
            </button>
            <button style={tabBtnStyle(activeTab === "progress")} onClick={() => setActiveTab("progress")}>
              📊 Tutor Progress
            </button>
          </div>

          {activeTab === "tutor" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "20px" }}>
              <h3 style={{ color: "#fff", fontSize: "14px", marginBottom: "15px", paddingLeft: "8px", fontWeight: "700", letterSpacing: "0.5px" }}>
                PREVIOUS CHATS
              </h3>
              
              <button
                onClick={handleNewConversation}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(6, 182, 212, 0.08)",
                  border: "1px dashed rgba(6, 182, 212, 0.4)",
                  borderRadius: "12px",
                  color: "#06B6D4",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  marginBottom: "15px",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.16)";
                  e.currentTarget.style.borderColor = "#06B6D4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.4)";
                }}
              >
                ➕ New Conversation
              </button>

              <div
                style={{
                  maxHeight: "calc(100vh - 460px)",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  paddingRight: "4px"
                }}
              >
                {conversations.length === 0 ? (
                  <div style={{ color: "#64748B", fontSize: "12px", textAlign: "center", padding: "10px 0" }}>
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((chat) => (
                    <div
                      key={chat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: currentChatId === chat.id ? "rgba(6, 182, 212, 0.1)" : "transparent",
                        border: "1px solid " + (currentChatId === chat.id ? "rgba(6, 182, 212, 0.25)" : "transparent"),
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => handleSelectConversation(chat.id)}
                      onMouseEnter={(e) => {
                        if (currentChatId !== chat.id) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentChatId !== chat.id) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                    >
                      <span
                        style={{
                          color: currentChatId === chat.id ? "#06B6D4" : "#94A3B8",
                          fontSize: "13px",
                          fontWeight: currentChatId === chat.id ? "600" : "400",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "140px"
                        }}
                      >
                        💬 {chat.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(chat.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#64748B",
                          cursor: "pointer",
                          fontSize: "12px",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#EF4444";
                          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#64748B";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Study Tip Box */}
          <div style={{ marginTop: "auto", padding: "16px", borderRadius: "14px", background: "rgba(6, 182, 212, 0.05)", border: "1px solid rgba(6, 182, 212, 0.15)", flexShrink: 0 }}>
            <h4 style={{ color: "#06B6D4", margin: "0 0 8px 0", fontSize: "13px" }}>🔥 Study Tip</h4>
            <p style={{ color: "#94A3B8", fontSize: "12px", lineHeight: "1.5", margin: 0 }}>
              Ask the tutor to explain concepts using analogies like: "Explain heart valves like doors."
            </p>
          </div>
        </aside>

        {/* Right Content Panel */}
        <main style={{ height: "100%", overflow: "hidden" }}>
          {activeTab === "tutor" && (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "15px", marginBottom: "15px" }}>
                <h2 style={{ fontSize: "24px", color: "#fff", fontWeight: "700" }}>AnatoMind Chat</h2>
                <p style={{ color: "#94A3B8", fontSize: "14px", margin: "4px 0 0 0" }}>Type your academic question and get a simple explanation.</p>
              </div>

              {/* Suggestions */}
              <div style={{ marginBottom: "15px" }}>
                <span style={{ color: "#E2E8F0", fontSize: "13px", fontWeight: "600", marginRight: "10px" }}>Suggested Topics:</span>
                {[
                  { text: "Heart blood flow", q: "Explain the path of blood through the heart simply." },
                  { text: "Brain lobes", q: "What do the four lobes of the brain do?" },
                  { text: "Lungs gas exchange", q: "Explain how oxygen enters the blood in the lungs." },
                ].map((s) => (
                  <button
                    key={s.text}
                    onClick={() => suggestTopic(s.q)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      color: "#06B6D4",
                      padding: "6px 12px",
                      fontSize: "12px",
                      marginRight: "8px",
                      cursor: "pointer",
                      transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  >
                    {s.text}
                  </button>
                ))}
              </div>

              {/* Message History */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: "10px",
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      background: msg.role === "user" ? "rgba(30, 41, 59, 0.9)" : "rgba(6, 182, 212, 0.08)",
                      border: "1px solid " + (msg.role === "user" ? "rgba(255,255,255,0.08)" : "rgba(6, 182, 212, 0.25)"),
                      borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                      padding: "16px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: "600", color: msg.role === "user" ? "#CBD5E1" : "#06B6D4", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {msg.role === "user" ? "You" : "Anatomy Tutor"}
                    </div>
                    <div style={{ color: "#E2E8F0", fontSize: "14px", lineHeight: "1.6" }}>
                      {renderMessageText(msg.text)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ alignSelf: "flex-start", background: "rgba(6, 182, 212, 0.04)", border: "1px solid rgba(6, 182, 212, 0.15)", borderRadius: "18px 18px 18px 2px", padding: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", background: "#06B6D4", borderRadius: "50%", animation: "spin 1s infinite alternate" }}></div>
                    <span style={{ color: "#06B6D4", fontSize: "13px", fontWeight: "600" }}>Tutor is thinking...</span>
                  </div>
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "15px", alignItems: "center" }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question like 'Explain liver function simply'..."
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  disabled={chatLoading}
                />
                
                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Listening... Click to stop" : "Speak your question"}
                  className={isListening ? "mic-button listening" : "mic-button"}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    background: isListening 
                      ? "rgba(239, 68, 68, 0.2)" 
                      : "rgba(255, 255, 255, 0.03)",
                    border: isListening 
                      ? "1px solid #EF4444" 
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isListening ? "#EF4444" : "#06B6D4",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </button>

                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #06B6D4, #2563EB)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {activeTab === "voice" && (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "15px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "24px", color: "#fff", fontWeight: "700" }}>Voice AI Tutor</h2>
                <p style={{ color: "#94A3B8", fontSize: "14px", margin: "4px 0 0 0" }}>Simulate voice dialogue with clear speech explanation generation.</p>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "#CBD5E1", fontWeight: "600" }}>Your Question</label>
                  <textarea
                    rows="4"
                    value={voiceInput}
                    onChange={(e) => setVoiceInput(e.target.value)}
                    placeholder="Ask a question verbally in text, e.g. 'Tell me about lungs.'"
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      color: "white",
                      fontSize: "14px",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                </div>

                <button
                  onClick={handleVoiceExplain}
                  disabled={voiceLoading || !voiceInput.trim()}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #06B6D4, #2563EB)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
                    transition: "all 0.3s ease"
                  }}
                >
                  {voiceLoading ? "Generating..." : "🔊 Explain Simply"}
                </button>

                <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                  <div style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", fontSize: "13px", color: "#F59E0B", marginBottom: "15px" }}>
                    ℹ️ Status: {voiceStatus}
                  </div>

                  {voiceAnswer && (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px" }}>
                      <h3 style={{ color: "#06B6D4", fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>Generated Explanation</h3>
                      <p style={{ color: "#E2E8F0", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{voiceAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress" && (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "15px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "24px", color: "#fff", fontWeight: "700" }}>Tutor Progress</h2>
                <p style={{ color: "#94A3B8", fontSize: "14px", margin: "4px 0 0 0" }}>Analysis metrics based on active quiz modules.</p>
              </div>

              {progressLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, flexDirection: "column" }}>
                  <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #06B6D4", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                  <p style={{ color: "#06B6D4", marginTop: "12px", fontWeight: "600" }}>Fetching tutor progress...</p>
                </div>
              ) : progressError ? (
                <div style={{ color: "#EF4444", fontSize: "14px" }}>{progressError}</div>
              ) : progressData ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                    <span style={{ fontSize: "24px" }}>👨‍🏫</span>
                    <h4 style={{ color: "#94A3B8", fontSize: "13px", marginTop: "10px", marginBottom: "6px" }}>Completed Sessions</h4>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#fff" }}>{progressData.sessions}</div>
                    <p style={{ color: "#64748b", fontSize: "11px", marginTop: "6px", lineHeight: "1.4" }}>Number of successfully completed quiz modules recorded.</p>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                    <span style={{ fontSize: "24px" }}>💡</span>
                    <h4 style={{ color: "#94A3B8", fontSize: "13px", marginTop: "10px", marginBottom: "6px" }}>Average Clarity (Accuracy)</h4>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#06B6D4" }}>{progressData.clarity}%</div>
                    <p style={{ color: "#64748b", fontSize: "11px", marginTop: "6px", lineHeight: "1.4" }}>Average medical factual accuracy achieved during quizzes.</p>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", gridColumn: "span 1" }}>
                    <span style={{ fontSize: "24px" }}>📚</span>
                    <h4 style={{ color: "#94A3B8", fontSize: "13px", marginTop: "10px", marginBottom: "6px" }}>Topics Covered</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {progressData.topics && progressData.topics.length > 0 ? (
                        progressData.topics.map((t) => (
                          <span key={t} style={{ padding: "4px 10px", background: "rgba(6, 182, 212, 0.12)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", fontSize: "12px", color: "#06B6D4", fontWeight: "600" }}>
                            {t}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "12px" }}>No topics registered. Take a quiz to cover anatomy!</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AITutor;
