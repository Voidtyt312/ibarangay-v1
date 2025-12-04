import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import useAdminBarangayInfo from '../hooks/useAdminBarangayInfo.js';
import { getDocumentRequestsByBarangay, updateRequestStatus } from '../services/adminApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import '../css/ManageRequest.css';

function ManageRequest({ onLogout, onNavigate }) {
  const [activeNav, setActiveNav] = useState('manage-request');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState({
    DocumentRequestID: '',
    DocumentType: '',
    Purpose: '',
    IdDocument: null,
    Status: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { barangayInfo } = useAdminBarangayInfo();

  // Fetch requests for this barangay
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        if (barangayInfo?.barangayId) {
          const data = await getDocumentRequestsByBarangay(barangayInfo.barangayId);
          setRequests(data || []);
          if (data && data.length > 0) {
            setSelectedRequest(data[0]);
          }
        }
      } catch (err) {
        setError('Failed to load requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (barangayInfo?.barangayId) {
      fetchRequests();
    }
  }, [barangayInfo]);

  const handleNavigate = (itemId) => {
    setActiveNav(itemId);
    if (onNavigate) {
      const pageMap = {
        statistics: 'statistics',
        post: 'post',
        'manage-request': 'manage-request',
        'manage-concern': 'manage-concern',
        history: 'admin-history',
      };
      const page = pageMap[itemId] || itemId;
      onNavigate(page);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.DocumentRequestID?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         req.DocumentType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setLoading(true);
      await updateRequestStatus(selectedRequest.DocumentRequestID, 'approved');
      setRequests(requests.map(r => 
        r.DocumentRequestID === selectedRequest.DocumentRequestID 
          ? { ...r, Status: 'approved' } 
          : r
      ));
      setSelectedRequest({ ...selectedRequest, Status: 'approved' });
    } catch (err) {
      setError('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    try {
      setLoading(true);
      await updateRequestStatus(selectedRequest.DocumentRequestID, 'cancelled');
      setRequests(requests.map(r => 
        r.DocumentRequestID === selectedRequest.DocumentRequestID 
          ? { ...r, Status: 'cancelled' } 
          : r
      ));
      setSelectedRequest({ ...selectedRequest, Status: 'cancelled' });
    } catch (err) {
      setError('Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  const handleReadyToPickup = async () => {
    if (!selectedRequest) return;
    try {
      setLoading(true);
      await updateRequestStatus(selectedRequest.DocumentRequestID, 'ready');
      setRequests(requests.map(r => 
        r.DocumentRequestID === selectedRequest.DocumentRequestID 
          ? { ...r, Status: 'ready' } 
          : r
      ));
      setSelectedRequest({ ...selectedRequest, Status: 'ready' });
    } catch (err) {
      setError('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="manage-request">
        <Sidebar activeItem={activeNav} onNavigate={handleNavigate} onLogout={onLogout} isAdmin={true} barangayName={barangayInfo?.barangay || 'iBarangay'} />
        <main className="manage-request-main">
          <LoadingSpinner label="Loading requests..." />
        </main>
      </div>
    );
  }

  return (
    <div className="manage-request">
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} onLogout={onLogout} isAdmin={true} barangayName={barangayInfo?.barangay || 'iBarangay'} />

      <main className="manage-request-main">
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
        
        <div className="request-list-section">
          <header className="section-header">
            <h1>Manage Requests - {barangayInfo?.barangay || 'iBarangay'}</h1>
            <p className="barangay-info">{barangayInfo?.municipality}, {barangayInfo?.province}</p>
          </header>

          <div className="search-filters">
            <div className="search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or ticket#"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sort-dropdown">
              <label>Sort Document by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">Select Option</option>
                <option value="date">Date</option>
                <option value="type">Document Type</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                <path d="M3 7h18" />
              </svg>
              <h3>No requests found</h3>
              <p>{searchQuery ? 'Try adjusting your search' : 'No document requests for this barangay yet'}</p>
            </div>
          ) : (
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Document Type</th>
                    <th>Purpose</th>
                    <th>Request Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                {filteredRequests.map((request) => (
                   <tr
                     key={request.DocumentRequestID}
                     className={selectedRequest?.DocumentRequestID === request.DocumentRequestID ? 'selected' : ''}
                     onClick={() => setSelectedRequest(request)}
                   >
                     <td>{request.DocumentRequestID}</td>
                     <td>{request.DocumentType}</td>
                     <td>{request.Purpose}</td>
                     <td>{new Date(request.DateRequested).toLocaleDateString()}</td>
                     <td><span className={`status ${request.Status}`}>{request.Status}</span></td>
                   </tr>
                 ))}
                </tbody>
                </table>
                </div>
                )}
                </div>

                {selectedRequest && (
                <div className="request-details-section">
          <header className="details-header">
            <h2>Request ID: {selectedRequest.DocumentRequestID}</h2>
            <span className={`status-badge ${selectedRequest.Status}`}>{selectedRequest.Status?.toUpperCase()}</span>
          </header>

          <div className="details-content">
            <div className="detail-field">
              <label>Document Type:</label>
              <span>{selectedRequest.DocumentType}</span>
            </div>

            <div className="detail-field">
              <label>Purpose:</label>
              <span>{selectedRequest.Purpose}</span>
            </div>

            {selectedRequest.IdDocument && (
            <div className="detail-field">
              <label>Valid ID:</label>
              <div className="id-preview">
                <img src={selectedRequest.IdDocument} alt="Valid ID" />
              </div>
            </div>
            )}

            <div className="action-buttons">
              <button 
                className="btn-approved" 
                onClick={handleApprove}
                disabled={selectedRequest?.Status === 'cancelled' || selectedRequest?.Status === 'approved'}
                title={selectedRequest?.Status === 'cancelled' ? 'Cannot approve a cancelled request' : selectedRequest?.Status === 'approved' ? 'Request already approved' : 'Approve this request'}
              >
                Approved
              </button>
              <button 
                className="btn-ready-pickup" 
                onClick={handleReadyToPickup}
                disabled={selectedRequest?.Status !== 'approved' || selectedRequest?.Status === 'cancelled'}
                title={selectedRequest?.Status === 'cancelled' ? 'Cannot mark cancelled request as ready' : selectedRequest?.Status !== 'approved' ? 'Request must be approved first' : 'Mark as ready for pickup'}
              >
                Ready to Pickup
              </button>
              <button 
                className="btn-done" 
                onClick={async () => {
                  if (!selectedRequest) return;
                  try {
                    setLoading(true);
                    await updateRequestStatus(selectedRequest.DocumentRequestID, 'done');
                    setRequests(requests.map(r => 
                      r.DocumentRequestID === selectedRequest.DocumentRequestID 
                        ? { ...r, Status: 'done' } 
                        : r
                    ));
                    setSelectedRequest({ ...selectedRequest, Status: 'done' });
                  } catch (err) {
                    setError('Failed to mark as done');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={selectedRequest?.Status !== 'approved' || selectedRequest?.Status === 'cancelled'}
                title={selectedRequest?.Status === 'cancelled' ? 'Cannot mark cancelled request as done' : selectedRequest?.Status !== 'approved' ? 'Request must be approved first' : 'Mark request as done'}
              >
                Done
              </button>
              <button 
                className="btn-cancel" 
                onClick={handleCancel}
                disabled={selectedRequest?.Status === 'cancelled' || selectedRequest?.Status === 'done'}
                title={selectedRequest?.Status === 'cancelled' ? 'Request already cancelled' : selectedRequest?.Status === 'done' ? 'Cannot cancel a completed request' : 'Cancel this request'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

export default ManageRequest;

