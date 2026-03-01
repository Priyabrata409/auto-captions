import { useState, useRef } from 'react';

const API_URL = 'https://priyabrata409-auto-captions.hf.space';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [appState, setAppState] = useState('upload'); // 'upload', 'processing', 'result', 'error'
  const [statusText, setStatusText] = useState('Processing Media...');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid audio or video file.');
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetApp = () => {
    setFile(null);
    setAppState('upload');
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
  };

  // Processing Handler
  const generateCaptions = async () => {
    if (!file) return;

    setAppState('processing');
    setErrorMessage('');
    setStatusText('Extracting audio and spinning up AI model...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'base');

    const statusInterval = setInterval(() => {
      const texts = [
        "Analyzing audio frames...",
        "Applying noise reduction...",
        "Transcribing speech to text...",
        "Aligning timestamps..."
      ];
      setStatusText(texts[Math.floor(Math.random() * texts.length)]);
    }, 5000);

    try {
      const response = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        body: formData
      });

      clearInterval(statusInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      setStatusText('Finalizing captions...');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setTimeout(() => {
        setAppState('result');
      }, 800);

    } catch (error) {
      console.error('Error during transcription:', error);
      clearInterval(statusInterval);
      setErrorMessage(error.message);
      setAppState('error');
    }
  };

  return (
    <div className="layout-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span className="logo-text">CapCutify AI</span>
        </div>
        <div className="nav-links">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Resources</a>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost">Log In</button>
          <button className="btn-primary-small">Get Started Free</button>
        </div>
      </nav>

      <main className="main-content">
        {/* Progress Stepper (Visible during processing/result) */}
        {appState !== 'upload' && appState !== 'error' && (
          <div className="progress-stepper">
            <div className={`step ${appState === 'processing' ? 'active' : 'completed'}`}>
              <div className="step-icon">1</div>
              <span>Upload</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${appState === 'processing' ? 'active' : 'completed'}`}>
              <div className="step-icon">2</div>
              <span>Transcribe</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${appState === 'result' ? 'active' : ''}`}>
              <div className="step-icon">3</div>
              <span>Export</span>
            </div>
          </div>
        )}

        {/* Upload State */}
        {(appState === 'upload' || appState === 'error') && (
          <div className="hero-section">
            <h1 className="hero-title">Auto-Subtitle Generator — <br /> 99% Accurate (Free)</h1>
            <p className="hero-subtitle">
              Instantly create precise subtitles for your videos with our powerful AI-driven platform. Fast, reliable, and completely free to start.
            </p>

            {appState === 'error' && (
              <div className="error-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Error: {errorMessage}
              </div>
            )}

            <div className="card-container">
              <div
                className={`dropzone-premium ${isDragging ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                {!file ? (
                  <div className="dropzone-content">
                    <div className="icon-wrapper">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <h2>Drag & Drop video or audio files</h2>
                    <p className="file-hints">Supports MP4, MP3, WAV, MOV | Max 2GB</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="audio/*,video/*"
                      hidden
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Choose File
                    </button>
                  </div>
                ) : (
                  <div className="file-selected-view">
                    <div className="file-info-large">
                      <div className="file-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                      </div>
                      <div className="file-details">
                        <span className="filename">{file.name}</span>
                        <span className="filesize">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <button type="button" onClick={removeFile} className="btn-icon-clear" title="Remove file">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-primary btn-generate"
                      onClick={generateCaptions}
                    >
                      Generate Subtitles Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
              <h3 className="features-title">Why Choose CapCutify AI?</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <div className="feature-text">
                    <h4>Multilingual Support</h4>
                    <p>Support for 130+ languages & accents. Transcribe English, Spanish, French, and more instantly.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </div>
                  <div className="feature-text">
                    <h4>Export SRT/MP4</h4>
                    <p>Easily download universally accepted subtitle formats (SRT, VTT) to use in Premiere, Final Cut, or YouTube.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing State with Video Player Mock */}
        {appState === 'processing' && (
          <div className="workspace-container">
            <div className="video-preview-panel">
              <div className="panel-header">
                <h3>Video Preview</h3>
                <span className="file-badge">{file?.name}</span>
              </div>
              <div className="video-player-mock">
                <div className="play-button-overlay">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div className="player-controls">
                  <div className="control-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
                  <div className="timeline-bar"><div className="timeline-progress"></div></div>
                  <div className="time-display">0:00 / 0:00</div>
                </div>
              </div>
            </div>

            <div className="action-panel">
              <div className="panel-header">
                <h3>Automated Transcription</h3>
                <span className="status-badge pulsing">In Progress...</span>
              </div>

              <div className="transcription-status-card">
                <h4>{statusText}</h4>
                <div className="progress-bar-container-premium">
                  <div className="progress-bar-fill animating"></div>
                </div>
                <div className="status-meta">
                  <span>Processing file securely...</span>
                  <span>AI Model: Whisper Base</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result State */}
        {appState === 'result' && (
          <div className="workspace-container">
            <div className="video-preview-panel">
              <div className="panel-header">
                <h3>Video Preview</h3>
                <span className="file-badge">{file?.name}</span>
              </div>
              <div className="video-player-mock success-state">
                <div className="subtitle-overlay-mock">
                  Subtitles generated successfully!
                </div>
                <div className="player-controls">
                  <div className="control-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
                  <div className="timeline-bar"><div className="timeline-progress full"></div></div>
                  <div className="time-display">Complete</div>
                </div>
              </div>
            </div>

            <div className="action-panel">
              <div className="panel-header">
                <h3>Export Options</h3>
                <span className="status-badge success">Complete</span>
              </div>

              <div className="export-card">
                <div className="success-check">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h2>Transcription Ready</h2>
                <p>Your highly accurate subtitle file is ready to use.</p>

                <div className="download-actions">
                  <a
                    href={downloadUrl}
                    className="btn-primary btn-download"
                    download={`captions_${file?.name?.replace(/\.[^/.]+$/, "") || 'video'}.srt`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download .SRT File
                  </a>

                  <button type="button" onClick={resetApp} className="btn-secondary">
                    Process Another Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Basic Footer */}
      {(appState === 'upload' || appState === 'error') && (
        <footer className="simple-footer">
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>
          <div className="copyright">© 2026 CapCutify AI</div>
        </footer>
      )}
    </div>
  );
}

export default App;
