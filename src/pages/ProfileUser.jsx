import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import '../css/ProfileUser.css';

function ProfileUser({ onLogout, onNavigate }) {
     const userId = localStorage.getItem('userId');
     const { barangayInfo } = useBarangayInfo(userId);

     const [profileData, setProfileData] = useState({
         fullName: '',
         email: '',
         phone: '',
         barangay: barangayInfo?.barangay || '',
         memberSince: '',
     });

     useEffect(() => {
         const loadProfileData = async () => {

            if (!userId) return;

            try {
                setLoadingProfile(true);
                const userResponse = await fetch(`/api/users/${userId}`);
                if (!userResponse.ok) return;

                const user = await userResponse.json();
                let barangayName = 'N/A';
                if (user.BarangayID) {
                    try {
                        const barangayResponse = await fetch('/api/barangays');
                        if (barangayResponse.ok) {
                            const barangays = await barangayResponse.json();
                            const barangay = barangays.find((b) => b.BarangayID === user.BarangayID);
                            if (barangay) {
                                barangayName = barangay.BarangayName;
                            }
                        }
                    } catch (err) {
                        console.error('Failed to fetch barangay name:', err);
                    }
                }

                setProfileData((prev) => ({
                    ...prev,
                    fullName: user.FullName || '',
                    email: user.Email || '',
                    phone: user.Phone_Number || '',
                    barangay: barangayName,
                    memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                }));
                if (user.ProfilePicture) {
                    setProfileImage(user.ProfilePicture);
                }
            } catch (err) {
                console.error('Failed to load profile data:', err);
                setSaveError('Failed to load profile data');
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfileData();
    }, []);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [settings, setSettings] = useState({
        darkMode: false,
        notifications: true,
        emailUpdates: true,
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const getInitials = (fullName) => {
        if (!fullName) return 'U';
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

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
            console.error("Camera error:", err);
            alert("Unable to access camera");
        }
    };

    const handleOpenCamera = () => {
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

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setProfileImage(imageData);
        if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach((t) => t.stop());
        }

        setShowCamera(false);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setSaveError('User not found. Please log in again.');
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            const updateData = {
                FullName: profileData.fullName,
                Email: profileData.email,
                Phone_Number: profileData.phone,
            };
            if (profileImage) {
                updateData.ProfilePicture = profileImage;
            }

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const error = await response.json();
                setSaveError(`Error updating profile: ${error.message || 'Unknown error'}`);
                return;
            }

            setSaveError(null);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to save profile:', err);
            setSaveError('Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSettingChange = (setting) => {
        setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
        if (setting === 'darkMode') {
            document.documentElement.classList.toggle('dark-mode');
        }
    };

    const handlePhotoClick = () => {
        setShowPhotoOptions(true);
    };

    const handleCameraCapture = () => {
        setShowPhotoOptions(false);
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
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxWidth = 800;
                        const maxHeight = 800;
                        if (width > height) {
                            if (width > maxWidth) {
                                height = (height * maxWidth) / width;
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = (width * maxHeight) / height;
                                height = maxHeight;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                        setProfileImage(compressedImage);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleDeleteAccount = () => {
        if (showDeleteConfirm) {
            alert('Account deletion requested. Please contact support for assistance.');
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleNavigate = (itemId) => {
        if (onNavigate) {
            const pageMap = {
                newsfeed: 'home',
                request: 'request',
                concern: 'concern',
                emergency: 'emergency',
                profile: 'profile',
                history: 'history',
            };
            const page = pageMap[itemId] || itemId;
            onNavigate(page);
        }
    };

    return (
        <div className="profile-user-page">
            <Sidebar activeItem="profile" onNavigate={handleNavigate} onLogout={onLogout} barangayName={barangayInfo?.barangay || 'iBarangay'} />

            <main className="profile-content">
                <header className="profile-header">
                    <h1>Profile</h1>
                    <p>Manage your account information and settings</p>
                </header>

                {loadingProfile && (
                    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <LoadingSpinner label="Loading profile..." />
                    </div>
                )}

                {!loadingProfile && (
                <div className="profile-card">
                    <div className="profile-picture-section">
                        <div className="profile-picture">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="profile-image" />
                            ) : (
                                <div className="avatar-placeholder">{getInitials(profileData.fullName)}</div>
                            )}
                            <button type="button" className="camera-btn" aria-label="Change profile picture" onClick={handlePhotoClick}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </button>
                        </div>
                        <h2>{profileData.fullName}</h2>
                    </div>

                    {showCamera && (
                        <div className="camera-container">
                            <div className="camera-overlay" style={{ zIndex: 10000 }}></div>
                            <div className="camera-content">
                                <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
                                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                                <div className="camera-controls">
                                    <button className="take-photo-btn" onClick={handleTakePhoto}>Capture Photo</button>
                                    <button className="close-camera-btn" onClick={() => setShowCamera(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPhotoOptions && (
                        <>
                            <div className="photo-options-overlay" style={{ zIndex: 10001 }} onClick={() => setShowPhotoOptions(false)}></div>
                            <div className="photo-options-modal" style={{ zIndex: 10002 }}>
                                <h3>Choose Photo Source</h3>
                                <div className="photo-options-buttons">
                                    <button type="button" className="photo-option-btn" onClick={handleCameraCapture}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        <span>Take Photo</span>
                                    </button>
                                    <button type="button" className="photo-option-btn" onClick={handleFilePicker}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <span>Choose from Files</span>
                                    </button>
                                </div>
                                <button type="button" className="cancel-photo-btn" onClick={() => setShowPhotoOptions(false)}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}

                    {saveError && (
                        <div style={{ marginBottom: '20px' }}>
                            <ErrorAlert 
                                message={saveError}
                                type="error"
                                onDismiss={() => setSaveError(null)}
                            />
                        </div>
                    )}

                    <div className="profile-details">
                        <div className="detail-item">
                            <div className="detail-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <label>Barangay</label>
                                <input
                                    type="text"
                                    name="barangay"
                                    value={profileData.barangay}
                                    disabled
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div className="detail-content">
                                <label>Member Since</label>
                                <input
                                    type="text"
                                    name="memberSince"
                                    value={profileData.memberSince}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Settings</h3>
                        <div className="settings-list">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Dark Mode</h4>
                                    <p>Switch to dark theme for better viewing in low light</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.darkMode}
                                        onChange={() => handleSettingChange('darkMode')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Notifications</h4>
                                    <p>Receive notifications about your requests and concerns</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications}
                                        onChange={() => handleSettingChange('notifications')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Email Updates</h4>
                                    <p>Get email notifications for important updates</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailUpdates}
                                        onChange={() => handleSettingChange('emailUpdates')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button type="button" className="save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            className="delete-btn"
                            onClick={handleDeleteAccount}
                        >
                            {showDeleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
                        </button>
                    </div>

                    {showDeleteConfirm && (
                        <div className="delete-warning">
                            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                            <div className="delete-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="confirm-delete-btn" onClick={handleDeleteAccount}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                )}

            </main>
        </div>

    );
}

export default ProfileUser;

