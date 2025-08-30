import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, CheckCircle } from 'lucide-react';
import './ClockModal.css';
import api from "../../../api/api";

const ClockModal = ({ isOpen, onClose, clockType, onClockSuccess }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedTime, setConfirmedTime] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [stream, setStream] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const modalContentRef = React.useRef(null);


  const getCurrentImage = () => {
    return capturedImage || uploadedImage;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      const modalContent = modalContentRef.current;
    
      setTimeout(() => {
        if (modalContent.scrollHeight > modalContent.clientHeight) {
          modalContent.style.overflowY = 'scroll';
        } else {
          modalContent.style.overflowY = 'auto';
        }
      }, 100);
    }
  }, [isOpen, userLocation, capturedImage, uploadedImage, isCameraActive]);

  useEffect(() => {
    if (isOpen) {
      getUserLocation();
      setLocationAddress('');
      setCapturedImage(null);
      setUploadedImage(null);
      setLocationError('');
      setIsCameraActive(false);
      setShowConfirmation(false);
      setIsVideoReady(false);
      stopCamera();
      
     
      document.body.style.overflow = 'hidden';
    } else {
      stopCamera();
 
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setIsLoadingLocation(false);
        getAddressFromCoordinates(location.latitude, location.longitude);
      },
      (error) => {
        setLocationError(`Location access denied: ${error.message}`);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setLocationAddress(data.display_name);
      } else {
        setLocationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setLocationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    
    if (stream) {
      console.log('Stopping all tracks...');
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track);
        track.stop();
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      console.log('Clearing video srcObject...');
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, [stream]);

  const waitForVideoElement = useCallback(async (maxAttempts = 20) => {
    for (let i = 0; i < maxAttempts; i++) {
      if (videoRef.current && videoRef.current.parentNode) {
        console.log(`Video element found after ${i + 1} attempts`);
        return videoRef.current;
      }
      console.log(`Waiting for video element... attempt ${i + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Video element not found after maximum attempts');
  }, []);

  const setupVideoStream = useCallback(async (mediaStream) => {
    try {
      console.log('Waiting for video element...');
      const videoElement = await waitForVideoElement();
      
      console.log('Video element found, setting up stream...');
      
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
      
      videoElement.srcObject = mediaStream;   
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('muted', '');
      videoElement.muted = true;
      videoElement.autoplay = true;
      
      const onLoadedMetadata = () => {
        console.log('Video metadata loaded');
        setIsVideoReady(true);
        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
      
      videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
      
      try {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Video playing successfully');
        }
      } catch (playError) {
        console.error('Play failed:', playError);
        console.log('Video play failed, but stream should still be visible');
      }
      
    } catch (error) {
      console.error('Error setting up video stream:', error);
      throw error;
    }
  }, [waitForVideoElement]);

  const startCamera = async () => {
    console.log('Starting camera...');
    
    try {
      stopCamera();
      setIsCameraActive(true);
      setIsVideoReady(false);

      console.log('Requesting camera permissions...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('Camera permission granted, got stream:', mediaStream);
      setStream(mediaStream);
    
      setTimeout(async () => {
        try {
          await setupVideoStream(mediaStream);
        } catch (setupError) {
          console.error('Failed to setup video stream:', setupError);
          mediaStream.getTracks().forEach(track => track.stop());
          setIsCameraActive(false);
          setStream(null);
          alert('Failed to setup camera. Please try again.');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraActive(false);
      setStream(null);
      
      let errorMessage = 'Could not access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      alert(errorMessage);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isVideoReady && videoRef.current.videoWidth > 0) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // resize canvas to a smaller resolution 
      const maxWidth = 640;
      const maxHeight = 480;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // mirror horizontally
      context.scale(-1, 1);
      context.drawImage(video, -width, 0, width, height);
      context.setTransform(1, 0, 0, 1, 0, 0); // reset transform

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.6); // quality 0.6
      setCapturedImage(imageDataUrl);
      setUploadedImage(null);
      stopCamera();
    } else {
      alert('Camera not ready. Please wait a moment and try again.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // target max dimensions
          const maxWidth = 640;
          const maxHeight = 480;
          let { width, height } = img;

          // scale down if too big
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // export compressed JPEG (quality 0.6)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);

          setUploadedImage(compressedDataUrl);
          setCapturedImage(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!userLocation) {
      alert("Please allow location access to continue.");
      return;
    }

    const currentImage = getCurrentImage();
    if (!currentImage) {
      alert("Please take a photo or upload an image to continue.");
      return;
    }

    try {
      const payload = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        address: locationAddress,
        base64Image: currentImage,
      };

      const endpoint = clockType === "in"
        ? "/attendance/clock-in"
        : "/attendance/clock-out";

      const res = await api.post(endpoint, payload);

      // set confirmation info
      setConfirmedTime(new Date(res.data.clockInAt || res.data.clockOutAt).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }));
      setConfirmedDate(new Date(res.data.clockInAt || res.data.clockOutAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }));

      setShowConfirmation(true);

      if (onClockSuccess) {
        onClockSuccess(res.data); // pass backend response
      }
    } catch (err) {
      console.error("Clock action failed:", err);
      alert(err.response?.data?.message || "Failed to clock in/out.");
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showConfirmation) {
    return (
      <div className="modal-overlay">
        <div className="confirmation-modal">
          <div className="confirmation-icon">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="confirmation-title">
            {confirmedTime} clocked {clockType} successfully!
          </h2>
          
          <p className="confirmation-date">
            {confirmedDate}
          </p>
          
          <p className="confirmation-message">
            Thank You!
          </p>
          
          <button
            onClick={handleConfirmationClose}
            className="confirmation-button"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        ref={modalContentRef}
        style={{

          minHeight: 'calc(90vh + 1px)',
          overflowY: 'scroll'
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            Clock {clockType === 'in' ? 'In' : 'Out'}
          </h2>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <span>×</span>
          </button>
        </div>

        <div className="modal-body">
          <div className="datetime-grid">
            <div className="date-card">
              <div className="datetime-header">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="datetime-title">Date</h3>
              </div>
              <p className="datetime-value date-value">
                {currentDateTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="time-card">
              <div className="datetime-header">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="datetime-title">Time</h3>
              </div>
              <p className="datetime-value time-value">
                {currentDateTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div>
            <div className="section-title">
              <span></span>
              <h3>Location</h3>
              {(isLoadingLocation || isLoadingAddress) && (
                <div className="loading-spinner"></div>
              )}
            </div>
            
            {locationError ? (
              <div className="status-error">
                <p className="error-text">{locationError}</p>
                <button
                  onClick={getUserLocation}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            ) : userLocation ? (
              <div className="status-success">
                <div className="map-container">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.longitude-0.01}%2C${userLocation.latitude-0.01}%2C${userLocation.longitude+0.01}%2C${userLocation.latitude+0.01}&layer=mapnik&marker=${userLocation.latitude}%2C${userLocation.longitude}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="map-iframe"
                    title="Location Map"
                  ></iframe>
                </div>
                <p className="success-text">✓ Location captured successfully</p>
                {isLoadingAddress ? (
                  <p className="loading-text">Getting address...</p>
                ) : (
                  <p className="address-text">
                     {locationAddress || `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`}
                  </p>
                )}
              </div>
            ) : (
              <div className="status-loading">
                <p className="loading-text">Accessing your location...</p>
              </div>
            )}
          </div>

          <div>
            <div className="section-title">
              <span></span>
              <h3>Photo</h3>
            </div>
            
            <div className="photo-container">
              {!isCameraActive && !getCurrentImage() && (
                <div className="photo-placeholder">
                  <div className="photo-preview">
                    <span></span>
                  </div>
                  <div className="photo-buttons">
                    <button
                      onClick={startCamera}
                      className="button-primary"
                    >
                      Take Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="button-secondary"
                    >
                       Upload Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
              
              {isCameraActive && !getCurrentImage() && (
                <div className="photo-placeholder">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-video"
                  />
                  {!isVideoReady && (
                    <div className="camera-loading">
                      <p>Starting camera...</p>
                    </div>
                  )}
                  <div className="photo-buttons">
                    <button
                      onClick={capturePhoto}
                      className="button-success"
                      disabled={!isVideoReady}
                    >
                      {isVideoReady ? 'Capture Photo' : 'Preparing...'}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="button-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {getCurrentImage() && (
                <div className="photo-placeholder">
                  <img
                    src={getCurrentImage()}
                    alt="Clock in/out photo"
                    className="photo-display"
                  />
                  <p className="photo-success-message">
                    ✓ Photo {capturedImage ? 'captured' : 'uploaded'} successfully
                  </p>
                  <div className="photo-buttons">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setUploadedImage(null);
                        startCamera();
                      }}
                      className="button-primary button-small"
                    >
                      Take New Photo
                    </button>
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setUploadedImage(null);
                        fileInputRef.current?.click();
                      }}
                      className="button-secondary button-small"
                    >
                      Upload Different
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="submit-section">
            <button
              onClick={handleSubmit}
              disabled={!userLocation || !getCurrentImage()}
              className="submit-button"
            >
              Submit Clock {clockType === 'in' ? 'In' : 'Out'}
            </button>
          </div>

          <div style={{ height: '50px', visibility: 'hidden' }}>Extra space for scroll test</div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ClockModal;