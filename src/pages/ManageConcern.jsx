import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import useAdminBarangayInfo from '../hooks/useAdminBarangayInfo.js';
import { getConcernsByBarangay, updateConcernStatus } from '../services/adminApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import '../css/ManageConcern.css';

function ManageConcern({ onLogout, onNavigate }) {
  const [activeNav, setActiveNav] = useState('manage-concern');
  const [concerns, setConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState({
    ConcernID: '',
    ConcernType: '',
    Description: '',
    Status: '',
    DateReported: null,
    AdminRemarks: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { barangayInfo } = useAdminBarangayInfo();

  // Fetch concerns for this barangay
  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        setError('');
        if (barangayInfo?.barangayId) {
          const data = await getConcernsByBarangay(barangayInfo.barangayId);
          setConcerns(data || []);
          if (data && data.length > 0) {
            setSelectedConcern(data[0]);
          }
        }
      } catch (err) {
        setError('Failed to load concerns');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (barangayInfo?.barangayId) {
      fetchConcerns();
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

  const filteredConcerns = concerns.filter((concern) => {
    const isActive = concern.Status !== 'resolved' && concern.Status !== 'cancelled';
    const matchesSearch =
      (concern.ConcernID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (concern.UserID || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (concern.Status || '').toLowerCase() === statusFilter;
    return isActive && matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'new':
        return 'status-new';
      case 'in-progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConcern) return;
    try {
      await updateConcernStatus(selectedConcern.ConcernID, 'in-progress', replyText);
      const updatedConcern = {
        ...selectedConcern,
        AdminRemarks: replyText,
        Status: 'in-progress',
      };
      setSelectedConcern(updatedConcern);
      
      // Update the concerns array
      setConcerns(concerns.map(c => c.ConcernID === selectedConcern.ConcernID ? updatedConcern : c));
      setReplyText('');
    } catch (err) {
      setError('Failed to send reply');
      console.error(err);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedConcern) return;
    try {
      await updateConcernStatus(selectedConcern.ConcernID, 'resolved');
      
      // Update the concerns array to remove the resolved concern
      const updatedConcerns = concerns.filter(c => c.ConcernID !== selectedConcern.ConcernID);
      setConcerns(updatedConcerns);
      
      // Select the next concern or clear selection
      if (updatedConcerns.length > 0) {
        setSelectedConcern(updatedConcerns[0]);
      } else {
        setSelectedConcern({
          ConcernID: '',
          ConcernType: '',
          Description: '',
          Status: '',
          DateReported: null,
          AdminRemarks: '',
        });
      }
    } catch (err) {
      setError('Failed to mark as resolved');
      console.error(err);
    }
  };

  return (
    <div className="manage-concern">
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} onLogout={onLogout} isAdmin={true} barangayName={barangayInfo?.barangay || 'iBarangay'} />

      <main className="manage-concern-main">
        <div className="concerns-list-section">
          <header className="section-header">
            <h1>Citizen Concerns Management</h1>
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

            <div className="filters-row">
              <div className="filter-group">
                <label>Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date Range:</label>
                <input
                  type="text"
                  placeholder="Select date range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                />
              </div>
            </div>

            <div className="status-legend">
              <div className="legend-item">
                <span className="legend-color status-new"></span>
                <span>Blue: New</span>
              </div>
              <div className="legend-item">
                <span className="legend-color status-in-progress"></span>
                <span>Yellow: In Progress</span>
              </div>
              <div className="legend-item">
                <span className="legend-color status-resolved"></span>
                <span>Green: Resolved</span>
              </div>
            </div>
          </div>

          <div className="concerns-table">
            <table>
              <thead>
                <tr>
                  <th>Reference#</th>
                  <th>Citizen Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredConcerns.map((concern) => (
                   <tr
                     key={concern.ConcernID}
                     className={`${selectedConcern?.ConcernID === concern.ConcernID ? 'selected' : ''} ${getStatusClass(concern.Status)}`}
                     onClick={() => setSelectedConcern(concern)}
                   >
                     <td>{concern.ConcernID}</td>
                     <td>{concern.UserID}</td>
                     <td>{concern.ConcernType}</td>
                     <td>
                       <span className={`status-badge ${getStatusClass(concern.Status)}`}>
                         {getStatusLabel(concern.Status)}
                       </span>
                     </td>
                     <td>{new Date(concern.DateReported).toLocaleDateString()}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="concern-details-section">
          <header className="details-header">
            <h2>Concern ID: {selectedConcern?.ConcernID}</h2>
          </header>

          <h3 className="concern-title">{selectedConcern?.ConcernType}</h3>

          <div className="concern-description">
            <h4>Citizen's Concern:</h4>
            <p>{selectedConcern?.Description}</p>
            <p className="submitted-date">Submitted: {selectedConcern?.DateReported ? new Date(selectedConcern.DateReported).toLocaleString() : 'N/A'}</p>
          </div>

          <div className="messages-thread">
            <div className="message citizen-message">
              <div className="message-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">Citizen</span>
                  <span className="message-time">{selectedConcern?.DateReported ? new Date(selectedConcern.DateReported).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="message-bubble">{selectedConcern?.Description}</div>
              </div>
            </div>

            {selectedConcern?.AdminRemarks && (
              <div className="message admin-message">
                <div className="message-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">Admin</span>
                    <span className="message-time">{selectedConcern?.DateResolved ? new Date(selectedConcern.DateResolved).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="message-bubble">{selectedConcern.AdminRemarks}</div>
                </div>
              </div>
            )}
          </div>

          <div className="reply-section">
            <textarea
              className="reply-input"
              placeholder="Type your response to the citizen..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="3"
            />
            <button className="send-button" onClick={handleSendReply} disabled={selectedConcern?.Status === 'resolved'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Reply
            </button>
          </div>

          <button className="btn-resolved" onClick={handleMarkResolved}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark as Resolved
          </button>
        </div>
      </main>
    </div>
  );
}

export default ManageConcern;

