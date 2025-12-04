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
    const matchesSearch =
      (concern.ConcernID || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (concern.UserID || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = concern.Status !== 'resolved' && concern.Status !== 'cancelled';
    return matchesSearch && isActive;
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
      setSelectedConcern({
        ...selectedConcern,
        AdminRemarks: replyText,
        Status: 'in-progress',
      });
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
      setSelectedConcern({
        ...selectedConcern,
        Status: 'resolved',
        DateResolved: new Date(),
      });
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


          </div>

          {filteredConcerns.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3>No active concerns found</h3>
              <p>{searchQuery ? 'Try adjusting your search' : 'No active concerns. Resolved concerns are in History.'}</p>
            </div>
          ) : (
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
          )}
        </div>

        <div className="concern-details-section">
          <header className="details-header">
            <h2>Concern ID: {selectedConcern?.ConcernID}</h2>
          </header>

          <h3 className="concern-title">{selectedConcern?.ConcernType}</h3>

          <div className="concern-description">
            <h4>Description:</h4>
            <p>{selectedConcern?.Description}</p>
            <p className="submitted-date">Submitted: {selectedConcern?.DateReported ? new Date(selectedConcern.DateReported).toLocaleString() : 'N/A'}</p>
            {selectedConcern?.AdminRemarks && (
              <div className="admin-remarks">
                <h4>Admin Remarks:</h4>
                <p>{selectedConcern.AdminRemarks}</p>
              </div>
            )}
          </div>

          <div className="reply-section">
            <textarea
              className="reply-input"
              placeholder="Compose reply.."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="3"
            />
            <button className="send-button" onClick={handleSendReply}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
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

