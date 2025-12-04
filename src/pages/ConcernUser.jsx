import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { getConcerns, createConcern } from '../services/api.js';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import '../css/ConcernUser.css';

const CONCERN_TYPES = [
  'Infrastructure',
  'Sanitation',
  'Security',
  'Health',
  'Environment',
  'Other',
];

const STATUS_OPTIONS = {
  pending: { label: 'Pending', color: '#f59e0b' },
  'in-progress': { label: 'In progress', color: '#ef4444' },
  resolved: { label: 'Resolved', color: '#10b981' },
};

function ConcernUser({ onLogout, onNavigate }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('new');
  const [formData, setFormData] = useState({
    concernType: '',
    otherConcernType: '',
    description: '',
    attachments: [],
  });
  const [errors, setErrors] = useState({});
  const [concerns, setConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchRetry, setFetchRetry] = useState(0);

  const userId = localStorage.getItem('userId');
  const { barangayInfo } = useBarangayInfo(userId);

  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const response = await getConcerns();
        // Filter to only show current user's concerns
        const userConcerns = response.data.filter(concern => concern.UserID === userId);
        const transformedConcerns = userConcerns.map((concern) => ({
          id: concern.ConcernID,
          title: concern.Description?.substring(0, 50) + '...',
          category: concern.ConcernType,
          referenceNo: concern.ConcernID,
          description: concern.Description,
          submitted: new Date(concern.DateReported).toLocaleDateString(),
          lastUpdate: concern.DateResolved 
            ? new Date(concern.DateResolved).toLocaleDateString()
            : new Date(concern.DateReported).toLocaleDateString(),
          status: concern.Status || 'pending',
          messages: [
            {
              sender: 'citizen',
              name: 'You',
              timestamp: new Date(concern.DateReported).toLocaleString(),
              content: concern.Description,
            },
            ...(concern.AdminRemarks
              ? [
                  {
                    sender: 'admin',
                    name: 'Admin',
                    timestamp: concern.DateResolved || new Date().toLocaleString(),
                    content: concern.AdminRemarks,
                  },
                ]
              : []),
          ],
          userReplyCount: 0,
          userId: concern.UserID,
          }));
          setConcerns(transformedConcerns);
          } catch (error) {
          console.error('Error fetching concerns:', error);
          setApiError('Failed to load your concerns. Please try again.');
          } finally {
          setLoading(false);
          }
          };

          if (userId) {
          fetchConcerns();
          }
          }, [fetchRetry, userId]);

  const handleRetryFetch = () => {
    setFetchRetry((prev) => prev + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachments: 'File size must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1024;
          const maxHeight = 1024;
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
          setFormData((prev) => ({ 
            ...prev, 
            attachments: [...prev.attachments, compressedImage] 
          }));
          setErrors((prev) => ({ ...prev, attachments: '' }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleUploadButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachments: 'File size must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1024;
          const maxHeight = 1024;
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
          setFormData((prev) => ({ 
            ...prev, 
            attachments: [...prev.attachments, compressedImage] 
          }));
          setErrors((prev) => ({ ...prev, attachments: '' }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.concernType) newErrors.concernType = 'Please select a concern type';
    if (formData.concernType === 'Other' && !formData.otherConcernType) {
      newErrors.otherConcernType = 'Please specify the concern type';
    }
    if (!formData.description) newErrors.description = 'Please provide a description';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConcernTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      concernType: value,
      otherConcernType: value === 'Other' ? prev.otherConcernType : '',
    }));
    if (errors.concernType) {
      setErrors((prev) => ({ ...prev, concernType: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSubmitting(true);
          const userId = localStorage.getItem('userId');
          if (!userId) {
            alert('User not found. Please log in again.');
            setSubmitting(false);
            return;
          }
          const userResponse = await fetch(`http://localhost:3001/api/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        
        if (!userData.BarangayID) {
          throw new Error('BarangayID not found in user data');
        }
        let concernTypeToSubmit = formData.concernType;
        if (formData.concernType === 'Other' && formData.otherConcernType) {
          concernTypeToSubmit = `Other: ${formData.otherConcernType}`;
        }

        const concernData = {
          UserID: userId,
          BarangayID: userData.BarangayID,
          ConcernType: concernTypeToSubmit,
          Description: formData.description,
          Attachments: formData.attachments.length > 0 ? formData.attachments[0] : null,
        };
        
        console.log('Submitting concern:', concernData);
        const response = await createConcern(concernData);
        let displayConcernType = formData.concernType;
        if (formData.concernType === 'Other' && formData.otherConcernType) {
          displayConcernType = `Other: ${formData.otherConcernType}`;
        }

        const newConcern = {
          id: response.data.ConcernID,
          title: formData.description.substring(0, 50) + (formData.description.length > 50 ? '...' : ''),
          category: displayConcernType,
          referenceNo: response.data.ConcernID,
          description: formData.description,
          submitted: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          lastUpdate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          status: 'pending',
          messages: [
            {
              sender: 'citizen',
              name: 'You',
              timestamp: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
              content: formData.description,
            },
          ],
          userReplyCount: 0,
        };
        setConcerns([newConcern, ...concerns]);
        setFormData({
          concernType: '',
          otherConcernType: '',
          description: '',
          attachments: [],
        });
        setActiveTab('my');
        alert('Concern submitted successfully! Your reference number is ' + newConcern.referenceNo);
      } catch (error) {
        console.error('Error submitting concern:', error);
        console.error('Error details:', error.response?.data || error.message);
        alert(`Failed to submit concern: ${error.response?.data?.error || error.message || 'Please try again.'}`);
      } finally {
        setSubmitting(false);
      }
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
    <div className="concern-user-page">
      <Sidebar activeItem="concern" onNavigate={handleNavigate} onLogout={onLogout} barangayName={barangayInfo?.barangay || 'iBarangay'} />

      <main className="concern-content">
        <header className="concern-header">
          <div>
            <h1>Submit Concerns</h1>
            <p>Report issues, complaints, or suggestions to the barangay</p>
          </div>
        </header>

        <div className="concern-tabs">
          <button
            type="button"
            className={activeTab === 'new' ? 'active' : ''}
            onClick={() => setActiveTab('new')}
          >
            Submit New Concern
          </button>
          <button
            type="button"
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            My Concerns
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="concern-form-card">
            <h2>Report a Concern</h2>

            <form onSubmit={handleSubmit} className="concern-form">
              <label>
                Concern Type <span className="required">*</span>
                <div className="select-wrapper">
                  <select
                    name="concernType"
                    value={formData.concernType}
                    onChange={handleConcernTypeChange}
                    className={errors.concernType ? 'error' : ''}
                  >
                    <option value="" disabled hidden>Select concern type</option>
                    {CONCERN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.concernType && <span className="error-text">{errors.concernType}</span>}
              </label>

              {formData.concernType === 'Other' && (
                <label>
                  Specify Concern Type <span className="required">*</span>
                  <input
                    type="text"
                    name="otherConcernType"
                    value={formData.otherConcernType}
                    onChange={handleInputChange}
                    placeholder="Please specify the concern type"
                    className={errors.otherConcernType ? 'error' : ''}
                  />
                  {errors.otherConcernType && <span className="error-text">{errors.otherConcernType}</span>}
                </label>
              )}

              <label>
                Description <span className="required">*</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Details of your concern. Please include location and any relevant information."
                  rows="5"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </label>

              <label>
                Attachments (Optional)
                <div
                  className="file-upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="concernFile"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="upload-button"
                    onClick={handleUploadButtonClick}
                  >
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Click to upload or drag and drop</p>
                    <small>PNG, JPG or PDF (MAX 5MB)</small>
                  </button>
                  {formData.attachments.length > 0 && (
                    <div className="attachments-list">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <span>✓ Image {index + 1} Uploaded</span>
                          <button
                            type="button"
                            className="remove-attachment"
                            onClick={() => removeAttachment(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.attachments && <span className="error-text">{errors.attachments}</span>}
              </label>

              <div className="guidelines-info">
                <h3>Guidelines</h3>
                <ul>
                  <li>Be specific and provide accurate information</li>
                  <li>Include photos or evidence if available</li>
                  <li>Concerns will be reviewed within 24-48 hours</li>
                  <li>You will receive updates on your concern status</li>
                  <li>For emergencies, please call (+63) 123-4567</li>
                </ul>
              </div>

              <div className="submit-wrapper">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Concern'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="my-concerns">
             {apiError && (
               <div style={{ marginBottom: '20px' }}>
                 <ErrorAlert 
                   message={apiError}
                   type="error"
                   onRetry={handleRetryFetch}
                   onDismiss={() => setApiError(null)}
                 />
               </div>
             )}
             {loading ? (
               <div className="empty-state">
                 <LoadingSpinner label="Loading your concerns..." />
               </div>
             ) : concerns.length === 0 ? (
               <div className="empty-state">
                 <p>No concerns submitted yet. Submit a new concern to get started.</p>
               </div>
             ) : selectedConcern ? (
              <div className="concern-detail-view">
                <button className="back-button" onClick={() => setSelectedConcern(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to Concerns
                </button>
                <div className="concern-detail-header">
                  <h2>Reference#: {selectedConcern.referenceNo}</h2>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: STATUS_OPTIONS[selectedConcern.status]?.color + '20',
                      color: STATUS_OPTIONS[selectedConcern.status]?.color,
                    }}
                  >
                    {STATUS_OPTIONS[selectedConcern.status]?.label}
                  </span>
                </div>
                <h3 className="concern-detail-title">{selectedConcern.title}</h3>
                <div className="conversation-thread">
                  {selectedConcern.messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                      <div className="message-avatar">
                        {message.sender === 'citizen' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        )}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-name">{message.name}</span>
                          <span className="message-time">{message.timestamp}</span>
                        </div>
                        <div className="message-bubble">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedConcern.userReplyCount < 3 && (
                  <div className="reply-section">
                    <textarea
                      className="reply-input"
                      placeholder="Type your message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows="3"
                    />
                    <button
                      className="send-button"
                      onClick={() => {
                        if (!replyText.trim()) return;
                        const newMessage = {
                          sender: 'citizen',
                          name: 'You',
                          timestamp: new Date().toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }),
                          content: replyText,
                        };
                        setConcerns((prev) =>
                          prev.map((c) =>
                            c.id === selectedConcern.id
                              ? {
                                  ...c,
                                  messages: [...c.messages, newMessage],
                                  userReplyCount: c.userReplyCount + 1,
                                }
                              : c
                          )
                        );
                        setSelectedConcern({
                          ...selectedConcern,
                          messages: [...selectedConcern.messages, newMessage],
                          userReplyCount: selectedConcern.userReplyCount + 1,
                        });
                        setReplyText('');
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedConcern.userReplyCount >= 3 && (
                  <div className="reply-limit-notice">
                    <p>You have reached the maximum of 3 replies for this concern. Please wait for admin response.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="concern-cards">
                {concerns.map((concern) => (
                  <div key={concern.id} className="concern-card" onClick={() => setSelectedConcern(concern)}>
                    <div className="card-left">
                      <div className="concern-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="card-content">
                        <div className="card-header">
                          <h3>{concern.title}</h3>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: STATUS_OPTIONS[concern.status]?.color + '20',
                              color: STATUS_OPTIONS[concern.status]?.color,
                            }}
                          >
                            {STATUS_OPTIONS[concern.status]?.label}
                          </span>
                          {concern.status === 'in-progress' && (
                            <div className="alert-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="card-details">
                          <p>
                            <strong>Reference No:</strong> {concern.referenceNo}
                          </p>
                          <p>
                            <strong>Category:</strong> {concern.category}
                          </p>
                          <p>
                            <strong>Description:</strong> {concern.description}
                          </p>
                          <p>
                            <strong>Submitted:</strong> {concern.submitted}
                          </p>
                          <p>
                            <strong>Last Update:</strong> {concern.lastUpdate}
                          </p>
                        </div>
                        {concern.messages && concern.messages.length > 1 && (
                          <div className="message-count">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {concern.messages.length} message{concern.messages.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
          </main>
          </div>
          );
          }

          export default ConcernUser;
