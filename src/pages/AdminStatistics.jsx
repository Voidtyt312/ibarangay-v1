import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import BarChart from '../components/BarChart.jsx';
import useAdminBarangayInfo from '../hooks/useAdminBarangayInfo.js';
import '../css/AdminStatistics.css';

function AdminStatistics({ onLogout, onNavigate }) {
  const [activeNav, setActiveNav] = useState('statistics');
  const [barangayName, setBarangayName] = useState('');
  const [stats, setStats] = useState({
    requests: 0,
    concerns: 0,
    pendingTasks: 0,
    usersInBarangay: 0,
  });
  const [concernTypesData, setConcernTypesData] = useState([]);
  const [documentRequestTypesData, setDocumentRequestTypesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartScale, setChartScale] = useState(5);

  const { barangayInfo } = useAdminBarangayInfo();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem('userId');
      const barangayId = localStorage.getItem('barangayId');

      if (!adminId || !barangayId) {
        console.error('Admin or barangay ID not found');
        return;
      }

      // Get admin's barangay name
      const barangaysRes = await fetch('http://localhost:3001/api/barangays');
      const barangays = await barangaysRes.json();
      const barangay = barangays.find((b) => b.BarangayID === barangayId);
      setBarangayName(barangay?.BarangayName || 'Unknown Barangay');

      // Get document requests for this barangay
      const requestsRes = await fetch('http://localhost:3001/api/document-requests');
      const allRequests = await requestsRes.json();
      const barangayRequests = allRequests.filter((r) => r.BarangayID === barangayId);

      // Get concerns for this barangay
      const concernsRes = await fetch('http://localhost:3001/api/concerns');
      const allConcerns = await concernsRes.json();
      const barangayConcerns = allConcerns.filter((c) => c.BarangayID === barangayId);

      // Get users in this barangay
      const usersRes = await fetch('http://localhost:3001/api/users');
      const allUsers = await usersRes.json();
      const barangayUsers = allUsers.filter((u) => u.BarangayID === barangayId);

      // Count by concern type for bar chart (matching ConcernUser dropdown)
      const concernTypes = ['Infrastructure', 'Sanitation', 'Security', 'Health', 'Environment', 'Other'];
      const concernTypeCount = {};
      
      // Initialize all concern types with 0
      concernTypes.forEach((type) => {
        concernTypeCount[type] = 0;
      });

      // Count concerns by type
      barangayConcerns.forEach((concern) => {
        const type = concern.ConcernType || 'Other';
        if (concernTypeCount.hasOwnProperty(type)) {
          concernTypeCount[type]++;
        } else {
          // Any custom concern type goes to "Other"
          concernTypeCount['Other']++;
        }
      });

      const concernChartData = Object.entries(concernTypeCount).map(([label, value]) => ({
        label,
        value,
      }));

      // Count by document request type (matching RequestUser dropdown)
      const documentTypes = [
        'Barangay Clearance',
        'Barangay Certificate',
        'Residency Certificate',
        'Indigency Certificate',
        'Business Permit',
        'Barangay ID',
        'Other',
      ];
      const documentTypeCount = {};

      // Initialize all document types with 0
      documentTypes.forEach((type) => {
        documentTypeCount[type] = 0;
      });

      // Count requests by type
      barangayRequests.forEach((req) => {
        const type = req.DocumentType || 'Other';
        if (documentTypeCount.hasOwnProperty(type)) {
          documentTypeCount[type]++;
        } else {
          // Any custom document type goes to "Other"
          documentTypeCount['Other']++;
        }
      });

      const documentChartData = Object.entries(documentTypeCount).map(([label, value]) => ({
        label,
        value,
      }));

      const maxConcernValue = Math.max(...concernChartData.map((d) => d.value), 5);
      const maxDocumentValue = Math.max(...documentChartData.map((d) => d.value), 5);

      setStats({
        requests: barangayRequests.length,
        concerns: barangayConcerns.length,
        pendingTasks: 0,
        usersInBarangay: barangayUsers.length,
      });

      setConcernTypesData(concernChartData);
      setDocumentRequestTypesData(documentChartData);
      } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="admin-statistics">
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} onLogout={onLogout} isAdmin={true} barangayName={barangayInfo?.barangay || 'iBarangay'} />

      <main className="statistics-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">Barangay</p>
            <h1>
              <span className="highlight">{barangayName}</span>
            </h1>
          </div>
        </header>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-content">
              <h3 className="stat-label">Request Forms</h3>
              <p className="stat-value">{stats.requests}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <h3 className="stat-label">Concerns</h3>
              <p className="stat-value">{stats.concerns}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <h3 className="stat-label">Users in Barangay</h3>
              <p className="stat-value">{stats.usersInBarangay}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="charts-row">
            <div className="chart-section">
              <h2 className="section-title">Concern Statistics</h2>
              <div className="chart-container">
                {concernTypesData.length > 0 ? (
                  <BarChart 
                    data={concernTypesData} 
                    maxValue={Math.max(...concernTypesData.map((d) => d.value), 5)}
                    scale={chartScale}
                    onScaleChange={setChartScale}
                  />
                ) : (
                  <p style={{ textAlign: 'center', color: '#666' }}>No concern data available</p>
                )}
              </div>
            </div>

            <div className="chart-section">
             <h2 className="section-title">Document Request Statistics</h2>
             <div className="chart-container">
               {documentRequestTypesData.length > 0 ? (
                 <BarChart 
                   data={documentRequestTypesData} 
                   maxValue={Math.max(...documentRequestTypesData.map((d) => d.value), 5)}
                   scale={chartScale}
                   onScaleChange={setChartScale}
                 />
               ) : (
                 <p style={{ textAlign: 'center', color: '#666' }}>No request data available</p>
               )}
             </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}

export default AdminStatistics;
