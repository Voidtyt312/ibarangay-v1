import { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../css/ProfileUser.css';

function ProfileUser({ onLogout, onNavigate }) {
  const [profileData, setProfileData] = useState({
    fullName: 'Zac Randolph Ragas',
    email: 'zac.ragas@email.com',
    phone: '+63 912 345 6789',
    address: 'Barangay Consolacion',
    memberSince: 'October 2025',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailUpdates: true,
  });

  // --------------------------
  // CAMERA STATES + REFS
  // --------------------------
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const openCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Unable to access camera.");
    }
  };

  const handleOpenCamera = () => {
    setShowPhotoOptions(false);
    setShowCamera(true);
    setTimeout(() => openCameraStream(), 300);
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setProfileImage(imageData);

    // Stop camera stream
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());

    setShowCamera(false);
  };

  // --------------------------
  // OLD PHOTO OPTIONS
  // UPDATED CAMERA BUTTON
  // --------------------------
  const handlePhotoClick = () => {
    setShowPhotoOptions(true);
  };

  const handleCameraCapture = () => {
    handleOpenCamera();
  };

  const handleFilePicker = () => {
    setShowPhotoOptions(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProfileImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // --------------------------
  // GENERAL PROFILE LOGIC
  // --------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('Profile updated successfully!');
  };

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
    if (setting === 'darkMode') {
      document.documentElement.classList.toggle('dark-mode');
    }
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      alert('Account deletion requested. Please contact support.');
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleNavigate = (itemId) => {
    if (itemId === 'newsfeed' && onNavigate) onNavigate('home');
    else if (itemId === 'request') onNavigate('request');
    else if (itemId === 'concern') onNavigate('concern');
    else if (itemId === 'emergency') onNavigate('emergency');
  };

  return (
    <div className="profile-user-page">
      <Sidebar activeItem="profile" onNavigate={handleNavigate} onLogout={onLogout} />

      <main className="profile-content">
        <header className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account information and settings</p>
        </header>

        <div className="profile-card">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="avatar-placeholder">ZR</div>
              )}
              <button type="button" className="camera-btn" onClick={handlePhotoClick}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
            <h2>{profileData.fullName}</h2>
          </div>

          {/* PHOTO OPTIONS MODAL */}
          {showPhotoOptions && (
            <>
              <div className="photo-options-overlay" onClick={() => setShowPhotoOptions(false)}></div>
              <div className="photo-options-modal">
                <h3>Choose Photo Source</h3>
                <div className="photo-options-buttons">
                  <button className="photo-option-btn" onClick={handleCameraCapture}>
                    <span>📷 Take Photo</span>
                  </button>

                  <button className="photo-option-btn" onClick={handleFilePicker}>
                    <span>📁 Choose from Files</span>
                  </button>
                </div>
                <button className="cancel-photo-btn" onClick={() => setShowPhotoOptions(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* CAMERA MODAL */}
          {showCamera && (
            <div className="camera-modal">
              <div className="camera-overlay"></div>

              <div className="camera-box">
                <video ref={videoRef} autoPlay playsInline className="camera-preview"></video>

                <button className="capture-btn" onClick={handleTakePhoto}>
                  Capture Photo
                </button>

                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

                <button className="close-camera-btn" onClick={() => setShowCamera(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* PROFILE DETAILS */}
          <div className="profile-details">
            {/* Email */}
            <div className="detail-item">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                </svg>
              </div>
              <div className="detail-content">
                <label>Email</label>
                <input type="email" name="email" value={profileData.email} onChange={handleInputChange} />
              </div>
            </div>

            {/* Phone */}
            <div className="detail-item">
              <div className="detail-icon"></div>
              <div className="detail-content">
                <label>Phone</label>
                <input type="tel" name="phone" value={profileData.phone} onChange={handleInputChange} />
              </div>
            </div>

            {/* Address */}
            <div className="detail-item">
              <div className="detail-content">
                <label>Address</label>
                <input type="text" name="address" value={profileData.address} onChange={handleInputChange} />
              </div>
            </div>

            {/* Member Since */}
            <div className="detail-item">
              <div className="detail-content">
                <label>Member Since</label>
                <input type="text" value={profileData.memberSince} readOnly />
              </div>
            </div>
          </div>

          {/* SETTINGS */}
          <div className="settings-section">
            <h3>Settings</h3>
            <div className="settings-list">

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.darkMode} onChange={() => handleSettingChange('darkMode')} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Notifications</h4>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.notifications} onChange={() => handleSettingChange('notifications')} />
                  <span className="slider"></span>
                </label>
              </div>

            </div>
          </div>

          <div className="profile-actions">
            <button className="save-btn" onClick={handleSave}>Save Changes</button>
            <button className="delete-btn" onClick={handleDeleteAccount}>
              {showDeleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="delete-warning">
              <p>This action cannot be undone.</p>
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfileUser;
