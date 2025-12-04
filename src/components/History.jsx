import { useState } from 'react';
import '../css/History.css';

function History({ userType = 'user', requests = [], concerns = [] }) {
  const [activeTab, setActiveTab] = useState('requests');

  // Filter requests and concerns based on status
  const finishedRequests = requests.filter(
    (req) => req.status === 'done' || req.status === 'cancelled'
  );
  const finishedConcerns = concerns.filter(
    (concern) => concern.status === 'resolved' || concern.status === 'cancelled'
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
      case 'resolved':
      case 'ready-to-pickup':
        return 'status-resolved';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatStatus = (status) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>History</h1>
        <p className="history-subtitle">View your completed, resolved, and cancelled items</p>
      </div>

      <div className="history-tabs">
        <button
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({finishedRequests.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'concerns' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerns')}
        >
          Concerns ({finishedConcerns.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'requests' && (
          <div className="history-section">
            {finishedRequests.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p>No completed or cancelled requests</p>
              </div>
            ) : (
              <div className="history-list">
                {finishedRequests.map((request) => (
                  <div key={request.id} className="history-item">
                    <div className="history-item-header">
                      <div className="history-item-id">
                        <span className="id-label">Request ID:</span>
                        <span className="id-value">{request.id}</span>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {formatStatus(request.status)}
                      </span>
                    </div>
                    <div className="history-item-body">
                      {userType === 'admin' && request.userId && (
                        <div className="history-item-field">
                          <span className="field-label">User ID:</span>
                          <span className="field-value">{request.userId}</span>
                        </div>
                      )}
                      <div className="history-item-field">
                        <span className="field-label">Document Type:</span>
                        <span className="field-value">{request.documentType}</span>
                      </div>
                      <div className="history-item-field">
                        <span className="field-label">Purpose:</span>
                        <span className="field-value">{request.purpose}</span>
                      </div>
                      <div className="history-item-field">
                        <span className="field-label">Request Date:</span>
                        <span className="field-value">{request.requestDate}</span>
                      </div>
                      {request.completedDate && (
                        <div className="history-item-field">
                          <span className="field-label">Completed Date:</span>
                          <span className="field-value">{request.completedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'concerns' && (
          <div className="history-section">
            {finishedConcerns.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3L2 9l10 6 10-6-10-6Z" />
                  <path d="M2 15l10 6 10-6" />
                </svg>
                <p>No resolved or cancelled concerns</p>
              </div>
            ) : (
              <div className="history-list">
                {finishedConcerns.map((concern) => (
                  <div key={concern.id} className="history-item">
                    <div className="history-item-header">
                      <div className="history-item-id">
                        <span className="id-label">Reference#:</span>
                        <span className="id-value">{concern.reference}</span>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(concern.status)}`}>
                        {formatStatus(concern.status)}
                      </span>
                    </div>
                    <div className="history-item-body">
                      {userType === 'admin' && concern.userId && (
                        <div className="history-item-field">
                          <span className="field-label">User ID:</span>
                          <span className="field-value">{concern.userId}</span>
                        </div>
                      )}
                      <div className="history-item-field">
                        <span className="field-label">Category:</span>
                        <span className="field-value">{concern.category}</span>
                      </div>
                      <div className="history-item-field">
                        <span className="field-label">Description:</span>
                        <span className="field-value">{concern.description}</span>
                      </div>
                      <div className="history-item-field">
                        <span className="field-label">Submitted Date:</span>
                        <span className="field-value">{concern.submittedDate}</span>
                      </div>
                      {concern.resolvedDate && (
                        <div className="history-item-field">
                          <span className="field-label">Resolved Date:</span>
                          <span className="field-value">{concern.resolvedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;

