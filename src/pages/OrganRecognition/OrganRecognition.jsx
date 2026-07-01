import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { identifyOrgan } from '../../services/visionApi';
import { FiUploadCloud, FiCamera, FiCheckCircle, FiAlertCircle, FiArrowRight, FiX, FiInfo } from 'react-icons/fi';
import './OrganRecognition.css';

const OrganRecognition = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setError(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await identifyOrgan(selectedImage);
      if (res.success && res.data) {
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setResult(res.data);
        }
      } else {
        setError(res.message || "Failed to analyze the image.");
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

  return (
    <div className="vision-page-container">
      <Navbar />
      <div className="vision-content">

        <div className="vision-header">
          <h1 className="vision-title">AI Organ Recognition</h1>
          <p className="vision-subtitle">Identify physical models or diagrams instantly with Gemini 2.5 Flash Multimodal AI.</p>
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
              <div className="preview-container fade-in-up">
                <button className="clear-btn" onClick={clearImage} disabled={loading} title="Clear Image">
                  <FiX />
                </button>
                <img src={imagePreview} alt="Organ Preview" className="image-preview" />
                <div className="preview-actions">
                  <button className="vision-btn analyze-btn" onClick={analyzeImage} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze Image"}
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

            {!loading && !result && !error && (
              <div className="empty-state fade-in-up">
                <FiCamera className="empty-icon" />
                <h3>Awaiting Image</h3>
                <p>Upload a human organ diagram or photo to see AI identification results.</p>
              </div>
            )}

            {!loading && error && (
              <div className="error-state fade-in-up">
                <FiAlertCircle className="error-icon" />
                <h3>Identification Rejected</h3>
                <p>{error}</p>
                <button className="vision-btn retry-btn" onClick={() => setError(null)}>Acknowledge</button>
              </div>
            )}

            {!loading && result && (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganRecognition;
