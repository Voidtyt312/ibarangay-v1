import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getBarangayAdmin } from '../services/api.js';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import '../css/EmergencyUser.css';

const NATIONAL_CONTACTS = [
  { id: 1, title: 'Philippine National Police', description: 'Non-emergency hotline for police assistance', phone: '117' },
  { id: 2, title: 'Bureau of Fire Protection', description: 'Emergency fire and rescue services', phone: '114' },
  { id: 3, title: 'Philippine Red Cross', description: 'Emergency medical and disaster response', phone: '02-143' },
  { id: 4, title: 'National Disaster Risk Reduction', description: 'Disaster response and emergency management', phone: '1-888-889-NDRRMC' },
];

function EmergencyUser({ onLogout, onNavigate }) {
  const [barangayAdmin, setBarangayAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');
  const { barangayInfo } = useBarangayInfo(userId);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch barangay admin contact based on user's barangayId
        if (barangayInfo?.barangayId) {
          try {
            const adminResponse = await getBarangayAdmin(barangayInfo.barangayId);
            if (adminResponse.data.hasAdmin) {
              setBarangayAdmin(adminResponse.data.admin);
            }
          } catch (adminErr) {
            console.error('Error fetching barangay admin:', adminErr);
            setError('Could not load barangay official contact');
          }
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [barangayInfo]);
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
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
    <div className="emergency-user-page">
      <Sidebar activeItem="emergency" onNavigate={handleNavigate} onLogout={onLogout} barangayName={barangayInfo?.barangay || 'iBarangay'} />

      <main className="emergency-content">
        <header className="emergency-header">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h1>Emergency Services</h1>
            <p>Quick access to emergency contacts and services</p>
          </div>
        </header>

        {barangayAdmin && (
          <section className="barangay-admin-contact">
            <div className="admin-card">
              <div className="admin-header">
                <div className="admin-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="admin-title">
                  <h2>Barangay Official</h2>
                  <p>{barangayInfo?.barangay || 'Barangay'}</p>
                </div>
              </div>
              <div className="admin-details">
                <div className="detail-item">
                  <span className="detail-label">Contact Number:</span>
                  <span className="detail-value">{barangayAdmin.ContactNumber}</span>
                </div>
                <button
                  type="button"
                  className="admin-call-btn"
                  onClick={() => handleCall(barangayAdmin.ContactNumber)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call Now
                </button>
              </div>
            </div>
          </section>
        )}



        <section className="national-contacts">
          <h2>National Emergency Hotlines</h2>
          <div className="national-list">
            {NATIONAL_CONTACTS.map((contact) => (
              <div key={contact.id} className="national-card">
                <div className="national-info">
                  <h3>{contact.title}</h3>
                  <p>{contact.description}</p>
                </div>
                <button type="button" className="national-call-btn" onClick={() => handleCall(contact.phone)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {contact.phone}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="emergency-tips">
          <h2>Emergency Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">🚨</div>
              <h3>Stay Calm</h3>
              <p>Remain calm and assess the situation before taking action. Panic can make emergencies worse.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📞</div>
              <h3>Call Immediately</h3>
              <p>Call emergency services right away. Provide clear location details and describe the situation accurately.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📍</div>
              <h3>Know Your Location</h3>
              <p>Always know your exact location. Use landmarks or GPS coordinates to help responders find you quickly.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">👥</div>
              <h3>Follow Instructions</h3>
              <p>Listen carefully to emergency operators and follow their instructions. They are trained to help you.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🏥</div>
              <h3>Medical Emergencies</h3>
              <p>For medical emergencies, don't move the injured person unless they're in immediate danger. Apply first aid if trained.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🔥</div>
              <h3>Fire Safety</h3>
              <p>In case of fire, evacuate immediately. Don't use elevators. Stay low if there's smoke and feel doors before opening.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EmergencyUser;

