import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { identifyOrgan, labelDiagram } from '../../services/visionApi';
import { FiUploadCloud, FiCamera, FiCheckCircle, FiAlertCircle, FiArrowRight, FiX, FiInfo } from 'react-icons/fi';
import { useGamification } from '../../contexts/GamificationContext';
import './OrganRecognition.css';

const OrganRecognition = () => {
  const navigate = useNavigate();
  const { addXP, awardBadge } = useGamification();
  const [mode, setMode] = useState('identify'); // 'identify' or 'label'
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [labels, setLabels] = useState(null);
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Camera handling
  useEffect(() => {
    let stream = null;
    if (cameraMode) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Camera access denied", err);
          setError("Camera access denied or unavailable.");
          setCameraMode(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError(null);
    setResult(null);
    setLabels(null);
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        processFile(file);
        setCameraMode(false);
      }, 'image/jpeg');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setLabels(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setLabels(null);
    
    try {
      if (mode === 'identify') {
        const res = await identifyOrgan(selectedImage);
        if (res.success && res.data) {
          if (res.data.error) {
            setError(res.data.error);
          } else {
            setResult(res.data);
            addXP(20, "Organ Identified");
          }
        } else {
          setError(res.message || "Failed to analyze the image.");
        }
      } else {
        const res = await labelDiagram(selectedImage);
        if (res.success && res.data) {
          if (res.data.error) {
            setError(res.data.error);
          } else if (Array.isArray(res.data)) {
            setLabels(res.data);
            addXP(25, "Diagram Labeled");
            awardBadge("vision_label");
          } else {
            setError("Unexpected data format from labeling service.");
          }
        } else {
          setError(res.message || "Failed to label the diagram.");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToViewer = () => {
    if (result && result.organ_name) {
      navigate(`/ar-viewer?organ=${result.organ_name}`);
    }
  };

  // Helper to draw bounding boxes
  const renderBoundingBoxes = () => {
    if (!labels || !imageRef.current) return null;

    const { width, height } = imageRef.current.getBoundingClientRect();
    
    return labels.map((item, index) => {
      // Box format: [ymin, xmin, ymax, xmax] scaled to 1000
      const [ymin, xmin, ymax, xmax] = item.box;
      
      const top = (ymin / 1000) * height;
      const left = (xmin / 1000) * width;
      const boxHeight = ((ymax - ymin) / 1000) * height;
      const boxWidth = ((xmax - xmin) / 1000) * width;

      return (
        <div 
          key={index} 
          className="bounding-box-overlay fade-in-up"
          style={{
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            height: `${boxHeight}px`,
            width: `${boxWidth}px`,
            border: '2px solid #00ffcc',
            backgroundColor: 'rgba(0, 255, 204, 0.15)',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(0, 255, 204, 0.5)'
          }}
        >
          <span 
            className="bounding-box-label"
            style={{
              position: 'absolute',
              top: '-25px',
              left: '-2px',
              backgroundColor: '#00ffcc',
              color: '#000',
              padding: '2px 8px',
              borderRadius: '4px 4px 4px 0',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {item.label}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="vision-page-container">
      <Navbar />
      <div className="vision-content">

        <div className="vision-header">
          <h1 className="vision-title">AI Vision Studio</h1>
          <p className="vision-subtitle">Identify physical models or label complex anatomical diagrams instantly with Gemini 2.5 Flash.</p>
          
          <div className="vision-mode-toggle">
            <button 
              className={`mode-btn ${mode === 'identify' ? 'active' : ''}`}
              onClick={() => { setMode('identify'); setResult(null); setLabels(null); setError(null); }}
            >
              Identify Organ
            </button>
            <button 
              className={`mode-btn ${mode === 'label' ? 'active' : ''}`}
              onClick={() => { setMode('label'); setResult(null); setLabels(null); setError(null); }}
            >
              Label Diagram
            </button>
          </div>
        </div>

        <div className="vision-workspace">
          {/* Left Panel: Upload or Camera */}
          <div className="vision-input-panel glass-card-vision">
            {!cameraMode && !imagePreview && (
              <div className="upload-container fade-in-up">
                <div 
                  className={`drop-zone ${dragActive ? "drag-active" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <FiUploadCloud className="upload-icon" />
                  <h3>Drag & Drop Image</h3>
                  <p>or click to browse from your device</p>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleChange} 
                    style={{ display: "none" }} 
                  />
                </div>
                
                <div className="divider">
                  <span>OR</span>
                </div>

                <button className="vision-btn primary-btn" onClick={() => setCameraMode(true)}>
                  <FiCamera /> Use Camera
                </button>
              </div>
            )}

            {cameraMode && (
              <div className="camera-container fade-in-up">
                <video ref={videoRef} autoPlay playsInline className="camera-feed"></video>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <div className="camera-controls">
                  <button className="vision-btn danger-btn" onClick={() => setCameraMode(false)}>Cancel</button>
                  <button className="vision-btn capture-btn" onClick={takePhoto}>
                    <div className="capture-inner"></div>
                  </button>
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="preview-container fade-in-up" style={{ position: 'relative' }}>
                <button className="clear-btn" onClick={clearImage} disabled={loading} title="Clear Image" style={{ zIndex: 10 }}>
                  <FiX />
                </button>
                <img 
                  ref={imageRef}
                  src={imagePreview} 
                  alt="Organ Preview" 
                  className="image-preview" 
                  style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '12px' }}
                />
                
                {renderBoundingBoxes()}

                <div className="preview-actions">
                  <button className="vision-btn analyze-btn" onClick={analyzeImage} disabled={loading}>
                    {loading ? "Analyzing..." : (mode === 'identify' ? "Identify Organ" : "Extract Labels")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Results */}
          <div className="vision-result-panel glass-card-vision">
            {loading && (
              <div className="loading-state">
                <div className="ai-loader">
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                  <div className="loader-core"></div>
                </div>
                <p>Gemini Vision AI is analyzing...</p>
              </div>
            )}

            {!loading && !result && !labels && !error && (
              <div className="empty-state fade-in-up">
                <FiCamera className="empty-icon" />
                <h3>Awaiting Image</h3>
                <p>Upload a human organ diagram or photo to see AI identification results.</p>
              </div>
            )}

            {!loading && error && (
              <div className="error-state fade-in-up">
                <FiAlertCircle className="error-icon" />
                <h3>Analysis Failed</h3>
                <p>{error}</p>
                <button className="vision-btn retry-btn" onClick={() => setError(null)}>Acknowledge</button>
              </div>
            )}

            {/* Result for Identify Mode */}
            {!loading && result && mode === 'identify' && (
              <div className="success-state fade-in-up">
                <div className="result-header">
                  <div className="result-icon-box">
                    <FiCheckCircle className="success-icon" />
                  </div>
                  <div>
                    <span className="confidence-badge">{result.confidence} Confidence</span>
                    <h2 className="result-title">{result.organ_name}</h2>
                  </div>
                </div>
                
                <div className="result-body">
                  <div className="info-box">
                    <h4><FiInfo /> Medical Description</h4>
                    <p>{result.description}</p>
                  </div>
                </div>

                <button className="vision-btn learn-more-btn" onClick={navigateToViewer}>
                  Learn About {result.organ_name} <FiArrowRight />
                </button>
              </div>
            )}

            {/* Result for Label Mode */}
            {!loading && labels && mode === 'label' && (
              <div className="success-state fade-in-up">
                <div className="result-header">
                  <div className="result-icon-box" style={{ background: 'rgba(0, 255, 204, 0.1)', color: '#00ffcc' }}>
                    <FiCheckCircle className="success-icon" />
                  </div>
                  <div>
                    <h2 className="result-title" style={{ fontSize: '1.2rem' }}>Diagram Labeled</h2>
                    <p style={{ color: '#aaa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                      Found {labels.length} anatomical structures.
                    </p>
                  </div>
                </div>
                
                <div className="result-body" style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {labels.map((item, idx) => (
                      <li key={idx} style={{ 
                        padding: '12px 16px', 
                        margin: '8px 0', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '8px',
                        borderLeft: '4px solid #00ffcc',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganRecognition;
