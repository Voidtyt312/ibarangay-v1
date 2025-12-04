import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { getDocumentRequests, createDocumentRequest } from '../services/api.js';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import '../css/RequestUser.css';

const DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Barangay Certificate',
  'Residency Certificate',
  'Indigency Certificate',
  'Business Permit',
  'Barangay ID',
  'Other',
];

const STATUS_OPTIONS = {
  pending: { label: 'Pending', color: '#f59e0b' },
  approved: { label: 'Approved', color: '#3b82f6' },
  ready: { label: 'Ready', color: '#10b981' },
  done: { label: 'Done', color: '#059669' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
};

function RequestUser({ onLogout, onNavigate }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('new');
  const [formData, setFormData] = useState({
    documentType: '',
    otherDocumentType: '',
    purpose: '',
    validID: [],
  });
  const [errors, setErrors] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchRetry, setFetchRetry] = useState(0);

  const userId = localStorage.getItem('userId');
  const { barangayInfo } = useBarangayInfo(userId);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const response = await getDocumentRequests();
        const transformedRequests = response.data.map((req) => ({
          id: req.DocumentRequestID,
          documentType: req.DocumentType,
          referenceNo: req.DocumentRequestID,
          purpose: req.Purpose,
          requestDate: new Date(req.DateRequested).toLocaleDateString(),
          completionDate: null,
          status: req.Status || 'pending',
        }));
        setRequests(transformedRequests);
      } catch (error) {
        console.error('Error fetching document requests:', error);
        setApiError('Failed to load your requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [fetchRetry]);

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
    const files = e.target.files;
    if (files.length > 0) {
      if (formData.validID.length + files.length > 2) {
        setErrors((prev) => ({ ...prev, validID: 'Maximum 2 files allowed (Front and Back of ID)' }));
        e.target.value = '';
        return;
      }

      Array.from(files).forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({ ...prev, validID: 'File size must be less than 5MB' }));
          e.target.value = '';
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
            setFormData((prev) => ({ ...prev, validID: [...prev.validID, compressedImage] }));
            setErrors((prev) => ({ ...prev, validID: '' }));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        });
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
   const files = e.dataTransfer.files;
   if (files.length > 0) {
     if (formData.validID.length + files.length > 2) {
       setErrors((prev) => ({ ...prev, validID: 'Maximum 2 files allowed (Front and Back of ID)' }));
       return;
     }

     Array.from(files).forEach((file) => {
       if (file.size > 5 * 1024 * 1024) {
         setErrors((prev) => ({ ...prev, validID: 'File size must be less than 5MB' }));
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
           setFormData((prev) => ({ ...prev, validID: [...prev.validID, compressedImage] }));
           setErrors((prev) => ({ ...prev, validID: '' }));
         };
         img.src = event.target.result;
       };
       reader.readAsDataURL(file);
     });
   }
  };

  const validateForm = () => {
   const newErrors = {};
   if (!formData.documentType) newErrors.documentType = 'Please select a document type';
   if (formData.documentType === 'Other' && !formData.otherDocumentType) {
     newErrors.otherDocumentType = 'Please specify the document type';
   }
   if (!formData.purpose) newErrors.purpose = 'Please enter the purpose';
   if (formData.validID.length === 0) newErrors.validID = 'Valid ID is required. Please upload your ID.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocumentTypeChange = (e) => {
   const { value } = e.target;
   setFormData((prev) => ({
     ...prev,
     documentType: value,
     otherDocumentType: value === 'Other' ? prev.otherDocumentType : '',
   }));
   if (errors.documentType) {
     setErrors((prev) => ({ ...prev, documentType: '' }));
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
        let documentTypeToSubmit = formData.documentType;
        if (formData.documentType === 'Other' && formData.otherDocumentType) {
          documentTypeToSubmit = `Other: ${formData.otherDocumentType}`;
        }

        const requestData = {
          UserID: userId,
          BarangayID: userData.BarangayID,
          DocumentType: documentTypeToSubmit,
          Purpose: formData.purpose,
          ValidID: formData.validID.length > 0 ? formData.validID[0] : null,
        };
        
        console.log('Submitting request:', requestData);
        const response = await createDocumentRequest(requestData);
        let displayDocumentType = formData.documentType;
        if (formData.documentType === 'Other' && formData.otherDocumentType) {
          displayDocumentType = `Other: ${formData.otherDocumentType}`;
        }

        const newRequest = {
          id: response.data.DocumentRequestID,
          documentType: displayDocumentType,
          referenceNo: response.data.DocumentRequestID,
          purpose: formData.purpose,
          requestDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          completionDate: null,
          status: 'pending',
        };
        setRequests([newRequest, ...requests]);
        setFormData({
          documentType: '',
          otherDocumentType: '',
          purpose: '',
          validID: [],
        });
        setActiveTab('my');
        setApiError(null);
        alert('Request submitted successfully! Your reference number is ' + newRequest.referenceNo);
      } catch (error) {
        console.error('Error submitting request:', error);
        console.error('Error details:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.error || error.message || 'Please try again.';
        setApiError(`Failed to submit request: ${errorMsg}`);
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
    <div className="request-user-page">
      <Sidebar activeItem="request" onNavigate={handleNavigate} onLogout={onLogout} barangayName={barangayInfo?.barangay || 'iBarangay'} />

      <main className="request-content">
        <header className="request-header">
          <div>
            <h1>Document Requests</h1>
            <p>Request official barangay documents online</p>
          </div>
        </header>

        <div className="request-tabs">
          <button
            type="button"
            className={activeTab === 'new' ? 'active' : ''}
            onClick={() => setActiveTab('new')}
          >
            New Request
          </button>
          <button
            type="button"
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            My Request
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="request-form-card">
            <h2>Request a Document</h2>

            <form onSubmit={handleSubmit} className="request-form">
              <label>
                Document Type <span className="required">*</span>
                <div className="select-wrapper">
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleDocumentTypeChange}
                    className={errors.documentType ? 'error' : ''}
                  >
                    <option value="" disabled hidden>Select document type</option>
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.documentType && <span className="error-text">{errors.documentType}</span>}
              </label>

              {formData.documentType === 'Other' && (
                <label>
                  Specify Document Type <span className="required">*</span>
                  <input
                    type="text"
                    name="otherDocumentType"
                    value={formData.otherDocumentType}
                    onChange={handleInputChange}
                    placeholder="Please specify the document type"
                    className={errors.otherDocumentType ? 'error' : ''}
                  />
                  {errors.otherDocumentType && <span className="error-text">{errors.otherDocumentType}</span>}
                </label>
              )}

              <label>
                Purpose <span className="required">*</span>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Enter the purpose of this document request"
                  rows="4"
                  className={errors.purpose ? 'error' : ''}
                />
                {errors.purpose && <span className="error-text">{errors.purpose}</span>}
              </label>

              <label>
                Upload Valid ID <span className="required">*</span>
                <div
                  className="file-upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="validID"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                    multiple
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
                    <small>PNG, JPG or PDF (MAX 5MB each, up to 2 files)</small>
                    </button>
                    {formData.validID.length > 0 && (
                     <div className="id-uploads-list">
                       {formData.validID.map((_, index) => (
                         <div key={index} className="id-upload-item">
                           <span>✓ ID {index === 0 ? 'Front' : 'Back'} Uploaded</span>
                           <button
                             type="button"
                             className="remove-id"
                             onClick={() => setFormData((prev) => ({
                               ...prev,
                               validID: prev.validID.filter((_, i) => i !== index),
                             }))}
                           >
                             ✕
                           </button>
                         </div>
                       ))}
                     </div>
                    )}
                </div>
                {errors.validID && <span className="error-text">{errors.validID}</span>}
              </label>

              <div className="processing-info">
                <h3>Processing Information</h3>
                <ul>
                  <li>Processing time: 1-3 business days</li>
                  <li>Pick up at Barangay Hall during office hours</li>
                  <li>Bring valid ID and reference number</li>
                  <li>Processing fee may apply upon pickup</li>
                </ul>
              </div>

              <div className="submit-wrapper">
                <button type="submit" className="submit-btn">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        ) : (
           <div className="my-requests">
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
                 <LoadingSpinner label="Loading your requests..." />
               </div>
             ) : requests.length === 0 ? (
              <div className="empty-state">
                <p>No requests yet. Submit a new request to get started.</p>
              </div>
            ) : (
              <div className="request-cards">
                {requests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="card-left">
                      <div className="doc-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <div className="card-content">
                        <div className="card-header">
                          <h3>{request.documentType}</h3>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: STATUS_OPTIONS[request.status]?.color + '20', color: STATUS_OPTIONS[request.status]?.color }}
                          >
                            {STATUS_OPTIONS[request.status]?.label}
                          </span>
                        </div>
                        <div className="card-details">
                          <p>
                            <strong>Reference No:</strong> {request.referenceNo}
                          </p>
                          <p>
                            <strong>Purpose:</strong> {request.purpose}
                          </p>
                          <p>
                            <strong>Request Date:</strong> {request.requestDate}
                          </p>
                          {request.completionDate && (
                            <p>
                              <strong>Completion Date:</strong> {request.completionDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.status === 'ready' && (
                      <div className="check-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
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

export default RequestUser;

