import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import History from '../components/History.jsx';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import useAdminBarangayInfo from '../hooks/useAdminBarangayInfo.js';
import '../css/HistoryPage.css';

function HistoryPage({ userType = 'user', onLogout, onNavigate }) {
  const [activeNav, setActiveNav] = useState(userType === 'admin' ? 'history' : 'history');
  const [requests, setRequests] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const { barangayInfo: userBarangayInfo } = useBarangayInfo(userType === 'user' ? userId : null);
  const { barangayInfo: adminBarangayInfo } = useAdminBarangayInfo(userType === 'admin');

  const barangayName = userType === 'admin' 
    ? adminBarangayInfo?.barangay || 'iBarangay'
    : userBarangayInfo?.barangay || 'iBarangay';

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');

        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch user's requests
        const requestsRes = await fetch(`http://localhost:3001/api/document-requests`);
        if (requestsRes.ok) {
          const allRequests = await requestsRes.json();
          const userRequests = allRequests.filter(
            (req) => req.UserID === userId && (req.Status === 'completed' || req.Status === 'cancelled')
          );
          const transformedRequests = userRequests.map((req) => ({
            id: req.DocumentRequestID,
            documentType: req.DocumentType,
            purpose: req.Purpose,
            requestDate: new Date(req.DateRequested).toLocaleDateString(),
            status: req.Status?.toLowerCase() || 'pending',
            completedDate: req.DateCompleted ? new Date(req.DateCompleted).toLocaleDateString() : null,
          }));
          setRequests(transformedRequests);
        }

        // Fetch user's concerns
        const concernsRes = await fetch(`http://localhost:3001/api/concerns`);
        if (concernsRes.ok) {
          const allConcerns = await concernsRes.json();
          const userConcerns = allConcerns.filter(
            (concern) => concern.UserID === userId && (concern.Status === 'resolved' || concern.Status === 'cancelled')
          );
          const transformedConcerns = userConcerns.map((concern) => ({
            id: concern.ConcernID,
            reference: concern.ConcernID,
            category: concern.ConcernType,
            description: concern.Description,
            submittedDate: new Date(concern.DateReported).toLocaleDateString(),
            status: concern.Status?.toLowerCase() || 'pending',
            resolvedDate: concern.DateResolved ? new Date(concern.DateResolved).toLocaleDateString() : null,
          }));
          setConcerns(transformedConcerns);
        }


      } catch (err) {
        console.error('Failed to fetch history data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  const handleNavigate = (itemId) => {
    setActiveNav(itemId);
    if (onNavigate) {
      const pageMap =
        userType === 'admin'
          ? {
              post: 'post',
              'manage-request': 'manage-request',
              'manage-concern': 'manage-concern',
              history: 'admin-history',
            }
          : {
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
    <div className={`history-page ${userType === 'admin' ? 'admin' : 'user'}`}>
      <Sidebar 
        activeItem={activeNav} 
        onNavigate={handleNavigate} 
        onLogout={onLogout} 
        isAdmin={userType === 'admin'} 
        barangayName={barangayName}
      />

      <main className="history-main">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading history...</p>
          </div>
        ) : (
          <History userType={userType} requests={requests} concerns={concerns} />
        )}
      </main>
    </div>
  );
}

export default HistoryPage;
