import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getEmergencyContacts, getBarangayAdmin } from '../services/api.js';
import useBarangayInfo from '../hooks/useBarangayInfo.js';
import '../css/EmergencyUser.css';

const NATIONAL_CONTACTS = [
  { id: 1, title: 'Philippine National Police', description: 'Non-emergency hotline for police assistance', phone: '117' },
  { id: 2, title: 'Bureau of Fire Protection', description: 'Emergency fire and rescue services', phone: '114' },
  { id: 3, title: 'Philippine Red Cross', description: 'Emergency medical and disaster response', phone: '02-143' },
  { id: 4, title: 'National Disaster Risk Reduction', description: 'Disaster response and emergency management', phone: '1-888-889-NDRRMC' },
];

function EmergencyUser({ onLogout, onNavigate }) {
  const [barangayContacts, setBarangayContacts] = useState([]);
  const [barangayAdmin, setBarangayAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');
  const { barangayInfo } = useBarangayInfo(userId);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await getEmergencyContacts();
        const contacts = response.data.map((contact, index) => ({
          ...contact,
          icon: ['phone', 'shield', 'medical', 'fire'][index % 4],
          color: ['#ef4444', '#3b82f6', '#10b981', '#ef4444'][index % 4],
        }));
        setBarangayContacts(contacts);

        // Fetch barangay admin contact
        if (barangayInfo?.barangayId) {
          try {
            const adminResponse = await getBarangayAdmin(barangayInfo.barangayId);
            if (adminResponse.data.hasAdmin) {
              setBarangayAdmin(adminResponse.data.admin);
            }
          } catch (adminErr) {
            console.error('Error fetching barangay admin:', adminErr);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching emergency contacts:', err);
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

        <section className="barangay-contacts">
          <h2>Barangay Emergency Contacts</h2>
          {loading && <p>Loading contacts...</p>}
          {error && <p style={{ color: 'red' }}>Error loading contacts: {error}</p>}
          <div className="contact-grid">
            {!loading && barangayContacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <div className="contact-icon" style={{ backgroundColor: contact.color + '20', color: contact.color }}>
                  {contact.icon === 'phone' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )}
                  {contact.icon === 'shield' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {contact.icon === 'medical' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                  {contact.icon === 'fire' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="contact-info">
                   <h3>{contact.Name}</h3>
                   <p>Emergency Contact</p>
                 </div>
                <button
                   type="button"
                   className="call-btn"
                   style={{ backgroundColor: contact.color }}
                   onClick={() => handleCall(contact.HotlineNumber)}
                 >
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                   </svg>
                   {contact.HotlineNumber}
                 </button>
              </div>
            ))}
          </div>
        </section>

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

