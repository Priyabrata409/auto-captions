import { useState, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);


  // App states: 'upload', 'processing', 'result', 'error'
  const [appState, setAppState] = useState('upload');

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
    setStatusText('Extracting audio and spinning up Whisper model...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'base');

    // Status updater interval
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

      // Artificial delay for smooth UX transition
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

  // Subcomponents Note: Usually in separate files, kept here for simplicity

  return (
    <div className="app-container">
      <header>
        <h1>AI Video Captioning</h1>
        <p>Generate highly accurate subtitles locally using OpenAI Whisper</p>
      </header>

      {/* Upload State */}
      {(appState === 'upload' || appState === 'error') && (
        <section className="upload-section">
          {appState === 'error' && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
              Error: {errorMessage}
            </div>
          )}

          <div
            className={`dropzone ${isDragging ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            {!file ? (
              <div className="dropzone-content">
                <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h3>Drag & Drop your Media</h3>
                <p>Supports MP4, MP3, WAV, M4A, AIFF</p>
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
                  style={{ marginTop: '0.5rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>{file.name}</span>
                </div>
                <button type="button" onClick={removeFile} className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>



          <button
            type="button"
            className="btn-primary btn-large"
            disabled={!file}
            onClick={generateCaptions}
          >
            Generate Captions
          </button>
        </section>
      )}

      {/* Processing State */}
      {appState === 'processing' && (
        <section className="status-section">
          <h3>{statusText}</h3>
          <div className="progress-bar-container">
            <div className={`progress-bar-fill animating`}></div>
          </div>
          <p className="status-details">
            This may take a minute depending on file size.
          </p>
        </section>
      )}

      {/* Result State */}
      {appState === 'result' && (
        <section className="result-section">
          <div className="success-icon-wrapper">
            <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Captions Generated!</h2>
          <p>Your subtitle file is ready for download.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <a
              href={downloadUrl}
              className="btn-success"
              download={`captions_${file?.name?.replace(/\.[^/.]+$/, "") || 'video'}.srt`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download .SRT
            </a>
            <button type="button" onClick={resetApp} className="btn-secondary">
              Process Another File
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
