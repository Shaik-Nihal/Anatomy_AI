import { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { sendTutorQuestion, getTutorSpeech } from "../../services/quizApi";
import { useAuth } from "../../contexts/AuthContext";
import { useGamification } from "../../contexts/GamificationContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./AITutor.css";

// ─── Browser TTS Speech Fallback Helper ────────────────────────────────────
const speakWithBrowserTTS = (text, onStart, onEnd) => {
  if (!window.speechSynthesis) {
    onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    // Remove markdown asterisks
    const cleanText = text.replace(/\*\*/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Browser speech synthesis error:", err);
    onEnd();
  }
};

// ─── 3D Model Mapping Helpers ────────────────────────────────────────────────
function getRegionFromMeshName(meshName, organ) {
  if (!meshName) return null;
  const nameLower = meshName.toLowerCase();

  if (organ === "Heart") {
    if (nameLower.includes("aorta")) return "Aorta";
    if (nameLower.includes("left_ventricle") || nameLower.includes("lv") || (nameLower.includes("ventricle") && nameLower.includes("left"))) return "Left Ventricle";
    if (nameLower.includes("right_ventricle") || nameLower.includes("rv") || (nameLower.includes("ventricle") && nameLower.includes("right"))) return "Right Ventricle";
    if (nameLower.includes("left_atrium") || nameLower.includes("la") || (nameLower.includes("atrium") && nameLower.includes("left"))) return "Left Atrium";
    if (nameLower.includes("right_atrium") || nameLower.includes("ra") || (nameLower.includes("atrium") && nameLower.includes("right"))) return "Right Atrium";
    if (nameLower.includes("pulmonary") || nameLower.includes("artery")) return "Pulmonary Artery";
    return "Myocardium / Heart Wall";
  } else if (organ === "Brain") {
    if (nameLower.includes("cerebellum")) return "Cerebellum";
    if (nameLower.includes("stem") || nameLower.includes("medulla") || nameLower.includes("pons") || nameLower.includes("spinal")) return "Brainstem";
    if (nameLower.includes("frontal")) return "Frontal Lobe";
    if (nameLower.includes("parietal")) return "Parietal Lobe";
    if (nameLower.includes("occipital")) return "Occipital Lobe";
    if (nameLower.includes("temporal")) return "Temporal Lobe";
    if (nameLower.includes("cortex") || nameLower.includes("cerebrum") || nameLower.includes("hemisphere")) return "Cerebral Cortex";
    return "Cerebral Hemisphere Region";
  }
  return meshName.replace(/_/g, " ");
}

function OrganModel({ organ, selectedRegion, isBeating }) {
  const originalMaterials = useRef(new Map());
  const groupRef = useRef();
  const targetScale = useRef(0);
  
  let modelPath = "/models/human_heart.glb"; // Default
  if (organ === "Brain") modelPath = "/models/human_brain_cerebrum__brainstem.glb";
  else if (organ === "Human Anatomy") modelPath = "/models/male_full_body_ecorche.glb";
  else if (organ === "Lungs") modelPath = "/models/respiratory_system.glb";
  else if (organ === "Kidney") modelPath = "/models/kidney.glb";
  else if (organ === "Stomach") modelPath = "/models/realistic_human_stomach.glb";
  else if (organ === "Intestines") modelPath = "/models/small_and_large_intestine.glb";
  else if (organ === "Skull") modelPath = "/models/human_male_skull.glb";
  else if (organ === "Skeleton") modelPath = "/models/ecorche_-_anatomy_study.glb";
  else if (organ === "Liver") modelPath = "/models/liver.glb";
  else if (organ === "Eye") modelPath = "/models/human_eye.glb";

  const { scene } = useGLTF(modelPath);

  // Back up original material settings to allow non-destructive glow tinting
  useEffect(() => {
    if (!scene) return;
    originalMaterials.current.clear();
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        originalMaterials.current.set(node.uuid, {
          color: node.material.color ? node.material.color.clone() : null,
          emissive: node.material.emissive ? node.material.emissive.clone() : null,
          emissiveIntensity: node.material.emissiveIntensity !== undefined ? node.material.emissiveIntensity : 0,
        });
      }
    });
  }, [scene]);

  // Handle color & glow updates when selectedRegion changes
  useEffect(() => {
    if (!scene) return;
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        const orig = originalMaterials.current.get(node.uuid);
        if (!orig) return;

        const nodeRegion = getRegionFromMeshName(node.name, organ);
        const isSelected = selectedRegion && nodeRegion && nodeRegion.toLowerCase() === selectedRegion.toLowerCase();

        if (isSelected) {
          if (node.material.color) node.material.color.setHex(0xa78bfa); // Glowing Purple
          if (node.material.emissive) {
            node.material.emissive.setHex(0xa78bfa);
            node.material.emissiveIntensity = 2.0;
          }
        } else {
          // Reset to initial settings
          if (node.material.color && orig.color) node.material.color.copy(orig.color);
          if (node.material.emissive && orig.emissive) {
            node.material.emissive.copy(orig.emissive);
            node.material.emissiveIntensity = orig.emissiveIntensity;
          }
        }
      }
    });
  }, [scene, selectedRegion, organ]);

  // Auto-scale and center the model uniformly using precise Mesh bounds
  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Reset group transforms to measure raw scene
    groupRef.current.scale.set(1, 1, 1);
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.updateMatrixWorld(true);

    // Compute bounding box strictly for visible meshes to ignore invisible lights/armatures
    const box = new THREE.Box3();
    box.makeEmpty();

    scene.traverse((node) => {
      if (node.isMesh && node.visible && !node.name.toLowerCase().includes('light') && !node.name.toLowerCase().includes('camera')) {
        node.geometry.computeBoundingBox();
        const meshBox = node.geometry.boundingBox.clone();
        meshBox.applyMatrix4(node.matrixWorld);
        box.union(meshBox);
      }
    });

    if (box.isEmpty()) {
      box.setFromObject(scene); // fallback if no meshes found
    }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Anatomical models often have long protruding vessels (ureters, veins) 
    // that heavily skew the geometric center away from the visual center of mass.
    const organConfig = {
      Kidney: { scaleMultiplier: 0.85, xOffset: -0.1, yOffset: 0.5, zOffset: 0 },
      Lungs: { scaleMultiplier: 0.9, xOffset: 0, yOffset: 0, zOffset: 0 },
      Stomach: { scaleMultiplier: 0.9, xOffset: 0, yOffset: 0, zOffset: 0 },
      Intestines: { scaleMultiplier: 0.9, xOffset: 0, yOffset: 0, zOffset: 0 },
      Skeleton: { scaleMultiplier: 1.0, xOffset: 0, yOffset: -0.4, zOffset: 0 },
      "Human Anatomy": { scaleMultiplier: 1.0, xOffset: 0, yOffset: -0.4, zOffset: 0 },
    };

    if (maxDim > 0) {
      let targetSize = 3.5;
      if (organ === "Human Anatomy" || organ === "Skeleton") targetSize = 4.8;

      const conf = organConfig[organ] || { scaleMultiplier: 1.0, xOffset: 0, yOffset: 0, zOffset: 0 };
      const scale = (targetSize / maxDim) * conf.scaleMultiplier;
      targetScale.current = scale;
      groupRef.current.scale.set(scale, scale, scale);

      // Auto-center based on bounds, then apply manual corrections for visual center of mass
      groupRef.current.position.set(
        (-center.x * scale) + conf.xOffset,
        (-center.y * scale) + conf.yOffset,
        (-center.z * scale) + conf.zOffset
      );
    }
  }, [scene, organ]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (organ === "Heart" && isBeating) {
      const elapsed = state.clock.getElapsedTime();
      let offset = 0;
      
      // Normal sinus beat (lub-dub)
      const t = (elapsed * 1.4) % 2.0;
      if (t < 0.25) {
        offset = Math.sin((t / 0.25) * Math.PI) * 0.06; // Lub
      } else if (t >= 0.3 && t < 0.55) {
        offset = Math.sin(((t - 0.3) / 0.25) * Math.PI) * 0.09; // Dub
      }
      
      const finalScale = targetScale.current * (1 + offset);
      groupRef.current.scale.set(finalScale, finalScale, finalScale);
    } else {
      if (targetScale.current > 0) {
        groupRef.current.scale.set(targetScale.current, targetScale.current, targetScale.current);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
function AITutor() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isBeating, setIsBeating] = useState(true);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom whenever chatMessages changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading]);

  const { user } = useAuth();
  const { addXP, awardBadge } = useGamification();

  // Speech recognition states & ref
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);

  const updateIsListening = (val) => {
    setIsListening(val);
    isListeningRef.current = val;
  };
  const recognitionRef = useRef(null);

  // MediaRecorder refs for Whisper fallback
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const userId = user?.email || "temp_user";

  // Chat History & Multiple Conversations states
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // 3D Canvas and Highlights states
  const [selectedOrgan, setSelectedOrgan] = useState("Heart");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const [isCallActive, setIsCallActive] = useState(false);
  const isCallActiveRef = useRef(false);
  const [autoSubmitText, setAutoSubmitText] = useState(null);
  const isProcessingQueryRef = useRef(false);

  // Load chat history from localStorage on mount or when userId changes
  useEffect(() => {
    const saved = localStorage.getItem(`anatomy_ai_tutor_history_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (err) {
        console.error("Failed to parse chat history", err);
      }
    } else {
      setConversations([]);
    }

    // Always start with a new conversation on mount/load
    setCurrentChatId(null);
    setChatMessages([
      { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
    ]);
  }, [userId]);

  // Cleanup mic & audio on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNewConversation = () => {
    setCurrentChatId(null);
    setChatMessages([
      { role: "assistant", text: "Hello! I am your AI Anatomy Tutor. Ask me any question about human organs, systems, or study recommendations." },
    ]);
    setChatInput("");
    setSelectedRegion(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setAudioPlaying(false);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSelectConversation = (id) => {
    const chat = conversations.find((c) => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setChatMessages(chat.messages);
      setSelectedRegion(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setAudioPlaying(false);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
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

  const toggleCall = () => {
    if (isCallActive) {
      setIsCallActive(false);
      isCallActiveRef.current = false;
      if (isListeningRef.current) toggleListening();
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsCallActive(true);
      isCallActiveRef.current = true;
      setVoiceEnabled(true);
      if (!isListeningRef.current) toggleListening();
    }
  };

  useEffect(() => {
    if (autoSubmitText) {
      setChatInput(autoSubmitText);
      submitQuery(autoSubmitText);
      setAutoSubmitText(null);
    }
  }, [autoSubmitText]);

  // Whisper MediaRecorder audio recording fallback
  const toggleWhisperRecording = async () => {
    if (isListeningRef.current) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      updateIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

          // Stop stream tracks to release microphone icon
          stream.getTracks().forEach(track => track.stop());

          setChatLoading(true);
          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            formData.append("language", "en");

            const response = await fetch(`${import.meta.env.VITE_QUIZ_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/voice/transcribe`, {
              method: "POST",
              body: formData
            });

            const data = await response.json();
            if (data && data.transcript) {
              const text = data.transcript;
              if (isCallActiveRef.current) {
                setAutoSubmitText(text);
              } else {
                setChatInput((prev) => (prev ? prev + " " + text : text));
              }
            }
          } catch (err) {
            console.error("Transcribe error:", err);
            alert("Failed to transcribe audio. Verify that the backend server is running.");
          } finally {
            setChatLoading(false);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        updateIsListening(true);
      } catch (err) {
        console.error("Microphone access failed:", err);
        alert("Could not access microphone: " + err.message);
      }
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // If the browser doesn't support Web Speech API natively (e.g. Brave blocks it),
    // we use our MediaRecorder + Whisper server fallback!
    if (!SpeechRecognition) {
      toggleWhisperRecording();
      return;
    }

    if (isListeningRef.current) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      updateIsListening(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-US";
      rec.interimResults = false;

      rec.onstart = () => {
        updateIsListening(true);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        updateIsListening(false);
        // If error in continuous mode, we might want to wait and restart, 
        // but for now, we just turn off the UI indicator.
      };

      rec.onend = () => {
        updateIsListening(false);
        // Automatically restart listening if call is active and we are NOT processing a query/playing audio
        if (isCallActiveRef.current && !isProcessingQueryRef.current) {
          setTimeout(() => {
            if (isCallActiveRef.current && !isListeningRef.current && !isProcessingQueryRef.current) {
              toggleListening();
            }
          }, 500);
        }
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (isCallActiveRef.current) {
          setAutoSubmitText(transcript);
        } else {
          setChatInput((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  // Scans answer text for anatomical region and organ keywords
  const scanTextForAnatomicalRegions = (text) => {
    if (!text) return { region: null, organ: null };
    const textLower = text.toLowerCase();

    const organScores = {
      Eye: (textLower.match(/\b(eye|eyes|ocular|optic)\b/g) || []).length,
      Kidney: (textLower.match(/\b(kidney|kidneys|renal)\b/g) || []).length,
      Lungs: (textLower.match(/\b(lung|lungs|respiratory|alveoli)\b/g) || []).length,
      Liver: (textLower.match(/\b(liver|hepatic)\b/g) || []).length,
      Stomach: (textLower.match(/\b(stomach|gastric)\b/g) || []).length,
      Intestines: (textLower.match(/\b(intestine|intestines|bowel|colon)\b/g) || []).length,
      Skull: (textLower.match(/\b(skull|cranium)\b/g) || []).length,
      Skeleton: (textLower.match(/\b(skeleton|bone|bones)\b/g) || []).length,
      Heart: (textLower.match(/\b(heart|aorta|ventricle|atrium|myocardium|pulmonary)\b/g) || []).length,
      Brain: (textLower.match(/\b(brain|cerebellum|cerebrum|hemisphere|brainstem|lobe|cortex)\b/g) || []).length,
      "Human Anatomy": (textLower.match(/\b(anatomy|body)\b/g) || []).length,
    };

    let detectedOrgan = null;
    let maxScore = 0;

    for (const [organ, score] of Object.entries(organScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedOrgan = organ;
      }
    }

    let detectedRegion = null;

    // 2. Region detection restricted to the identified organ
    if (detectedOrgan === "Brain") {
      if (textLower.includes("cerebellum")) detectedRegion = "Cerebellum";
      else if (textLower.includes("brainstem") || textLower.includes("stem")) detectedRegion = "Brainstem";
      else if (textLower.includes("frontal")) detectedRegion = "Frontal Lobe";
      else if (textLower.includes("parietal")) detectedRegion = "Parietal Lobe";
      else if (textLower.includes("occipital")) detectedRegion = "Occipital Lobe";
      else if (textLower.includes("temporal")) detectedRegion = "Temporal Lobe";
      else if (textLower.includes("cortex") || textLower.includes("cerebrum")) detectedRegion = "Cerebral Cortex";
    } else if (detectedOrgan === "Heart") {
      if (textLower.includes("aorta")) detectedRegion = "Aorta";
      else if (textLower.includes("left ventricle") || (textLower.includes("ventricle") && textLower.includes("left"))) detectedRegion = "Left Ventricle";
      else if (textLower.includes("right ventricle") || (textLower.includes("ventricle") && textLower.includes("right"))) detectedRegion = "Right Ventricle";
      else if (textLower.includes("left atrium") || (textLower.includes("atrium") && textLower.includes("left"))) detectedRegion = "Left Atrium";
      else if (textLower.includes("right atrium") || (textLower.includes("atrium") && textLower.includes("right"))) detectedRegion = "Right Atrium";
      else if (textLower.includes("pulmonary") || textLower.includes("artery")) detectedRegion = "Pulmonary Artery";
    } else if (detectedOrgan === "Kidney") {
       if (textLower.includes("cortex")) detectedRegion = "Cortex";
       else if (textLower.includes("medulla") || textLower.includes("pyramid")) detectedRegion = "Medulla pyramid";
       else if (textLower.includes("ureter")) detectedRegion = "Ureter";
       else if (textLower.includes("capsule")) detectedRegion = "Capsule";
    }

    return { region: detectedRegion, organ: detectedOrgan };
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    submitQuery(chatInput.trim());
  };

  const submitQuery = async (query) => {
    isProcessingQueryRef.current = true;

    // Explicitly stop the microphone if it's currently on, so it doesn't pick up the AI's voice
    if (isListeningRef.current) {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      updateIsListening(false);
    }

    const newUserMsg = { role: "user", text: query };
    setChatInput("");
    setChatLoading(true);
    setSelectedRegion(null);

    // Stop currently playing voice speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setAudioPlaying(false);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Instantly switch organ based on user's query
    const { organ: queryOrgan } = scanTextForAnatomicalRegions(query);
    if (queryOrgan) {
      setSelectedOrgan(queryOrgan);
    }

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
      const res = await sendTutorQuestion(query, isCallActiveRef.current);
      const assistantMsg = { role: "assistant", text: res.answer };
      const finalMessages = [...baseMessages, assistantMsg];

      setChatMessages(finalMessages);
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === activeId ? { ...c, messages: finalMessages } : c));
        localStorage.setItem(`anatomy_ai_tutor_history_${userId}`, JSON.stringify(next));
        return next;
      });

      // Award XP for learning!
      addXP(5, "AI Tutor Query");
      awardBadge("tutor_chat");

      // ── TRIGGER ANATOMICAL SCANNING & VOICE HIGHLIGHTS ──
      const { region, organ } = scanTextForAnatomicalRegions(res.answer);
      if (organ) {
        setSelectedOrgan(organ);
      }

      if (voiceEnabled) {
        try {
          if (region) {
            setSelectedRegion(region);
          }
          const audioBlob = await getTutorSpeech(res.answer);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onplay = () => setAudioPlaying(true);
          audio.onended = () => {
            setAudioPlaying(false);
            setSelectedRegion(null);
            isProcessingQueryRef.current = false;
            if (isCallActiveRef.current) {
              setTimeout(() => {
                if (isCallActiveRef.current && !isListeningRef.current) toggleListening();
              }, 500);
            }
          };
          audio.onerror = () => {
            setAudioPlaying(false);
            setSelectedRegion(null);
            isProcessingQueryRef.current = false;
            if (isCallActiveRef.current && !isListeningRef.current) toggleListening();
          };

          audio.play();
        } catch (speechErr) {
          console.warn("OpenAI TTS synthesis failed, falling back to browser Speech Synthesis:", speechErr);
          speakWithBrowserTTS(
            res.answer,
            () => setAudioPlaying(true),
            () => {
              setAudioPlaying(false);
              setSelectedRegion(null);
              isProcessingQueryRef.current = false;
              if (isCallActiveRef.current) {
                setTimeout(() => {
                  if (isCallActiveRef.current && !isListeningRef.current) toggleListening();
                }, 500);
              }
            }
          );
        }
      } else {
        // If voice is muted, flash the region highlight for 5 seconds
        if (region) {
          setSelectedRegion(region);
          setTimeout(() => {
            setSelectedRegion(null);
          }, 5000);
        }
        isProcessingQueryRef.current = false;
        if (isCallActiveRef.current && !isListeningRef.current) toggleListening();
      }
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
      isProcessingQueryRef.current = false;
      if (isCallActiveRef.current && !isListeningRef.current) toggleListening();
    } finally {
      setChatLoading(false);
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

  return (
    <div
      style={{
        height: "100vh",
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
            <button style={tabBtnStyle(true)}>
              💬 Chat Tutor
            </button>
          </div>

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

          {/* Study Tip Box */}
          <div style={{ marginTop: "auto", padding: "16px", borderRadius: "14px", background: "rgba(6, 182, 212, 0.05)", border: "1px solid rgba(6, 182, 212, 0.15)", flexShrink: 0 }}>
            <h4 style={{ color: "#06B6D4", margin: "0 0 8px 0", fontSize: "13px" }}>🔥 Study Tip</h4>
            <p style={{ color: "#94A3B8", fontSize: "12px", lineHeight: "1.5", margin: 0 }}>
              Ask the tutor to explain concepts using analogies like: "Explain heart valves like doors."
            </p>
          </div>
        </aside>

        {/* Column 2: Chat Panel */}
        <div className="tutor-chat-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "15px", marginBottom: "15px" }}>
            <div>
              <h2 style={{ fontSize: "24px", color: "#fff", fontWeight: "700", margin: 0 }}>AnatoMind Chat</h2>
              <p style={{ color: "#94A3B8", fontSize: "14px", margin: "4px 0 0 0" }}>Type your academic question and get a simple explanation.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !voiceEnabled;
                  setVoiceEnabled(nextVal);
                  if (!nextVal && audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                    setAudioPlaying(false);
                    setSelectedRegion(null);
                  }
                  if (!nextVal && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                title={voiceEnabled ? "Mute Voice Speech" : "Speak Voice Speech"}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid " + (voiceEnabled ? "#06B6D4" : "rgba(255,255,255,0.08)"),
                  color: voiceEnabled ? "#06B6D4" : "#64748B",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease"
                }}
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>
            </div>
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
          <div className="tutor-message-history">
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
            <div ref={chatEndRef} />
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
                background: "rgba(255, 255, 255, 0.03)",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
              disabled={chatLoading}
            />

            {/* Voice Input Mic Button - Toggles Continuous Call Mode */}
            <button
              type="button"
              onClick={toggleCall}
              title={isCallActive ? "End Voice Call" : "Start Voice Call"}
              className={isListening ? "mic-button listening" : "mic-button"}
              style={{
                padding: "14px",
                borderRadius: "14px",
                background: isCallActive
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(255, 255, 255, 0.03)",
                border: isCallActive
                  ? "1px solid #EF4444"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                color: isCallActive ? "#EF4444" : "#06B6D4",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                position: "relative"
              }}
            >
              {isListening && (
                <div style={{
                  position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px",
                  backgroundColor: "#EF4444", borderRadius: "50%",
                  animation: "pulse 1.5s infinite"
                }} />
              )}
              {isCallActive && !isListening && (
                <div style={{
                  position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px",
                  backgroundColor: "#F59E0B", borderRadius: "50%"
                }} title="Waiting for response..." />
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
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

        {/* Column 3: 3D Visualizer */}
        <div className="tutor-3d-visualizer">
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "15px", marginBottom: "15px" }}>
            <h3 style={{ fontSize: "18px", color: "#fff", fontWeight: "700", margin: 0 }}>Interactive 3D Visualizer</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 0 0" }}>
              <p style={{ color: "#94A3B8", fontSize: "12px", margin: 0 }}>Active Model: <strong style={{ color: "#06B6D4" }}>{selectedOrgan}</strong></p>
              {selectedOrgan === "Heart" && (
                <button
                  onClick={() => setIsBeating(!isBeating)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: isBeating ? "#ef4444" : "#94A3B8",
                    fontSize: "11px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  {isBeating ? "⏹️ Stop Beating" : "▶️ Play Beating"}
                </button>
              )}
            </div>
          </div>

          <div className="tutor-canvas-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[2, 2, 2]} intensity={2.0} />
              <pointLight position={[-2, -2, -2]} intensity={1.0} />

              <OrganModel
                organ={selectedOrgan}
                selectedRegion={selectedRegion}
                isBeating={isBeating}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>

            {/* Highlight Indicator Overlay */}
            {selectedRegion && (
              <div style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                background: "rgba(167, 139, 250, 0.95)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(167, 139, 250, 0.4)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span>✨ Speaking of:</span>
                <strong style={{ textDecoration: "underline" }}>{selectedRegion}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AITutor;