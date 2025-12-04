import { useState, useEffect, useMemo } from 'react';
import { getOfficials, createBarangay, getBarangays, getUsers } from '../services/api.js';
import '../css/SuperAdminHomepage.css';



function SuperAdminHomepage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('admins');
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [barangayAdminMap, setBarangayAdminMap] = useState({});
  const [barangaySort, setBarangaySort] = useState('asc'); // 'asc' or 'desc'
  const [contactMessageFilter, setContactMessageFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [formData, setFormData] = useState({
    barangayName: '',
    municipality: '',
    province: '',
  });
  const [formMessage, setFormMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate stats with useMemo for efficiency
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalAdmins = admins.length;
    const approvedAdmins = admins.filter((admin) => admin.status === 'approved').length;
    const pendingAdmins = admins.filter((admin) => admin.status === 'pending').length;
    
    return {
      totalUsers,
      totalAdmins,
      approvedAdmins,
      pendingAdmins,
    };
  }, [users, admins]);

  useEffect(() => {
    fetchUsers();
    fetchAdmins();
    fetchBarangays();
    fetchContactMessages();
  }, []);

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUsers(), fetchAdmins(), fetchBarangays(), fetchContactMessages()]);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      const mappedUsers = response.data.map((user) => {
        // Build address from barangay info
        const barangayInfo = [user.BarangayName, user.Municipality, user.Province]
          .filter(Boolean)
          .join(', ');

        return {
          id: user.UserID,
          name: user.FullName,
          email: user.Email,
          address: barangayInfo || 'N/A',
          registeredDate: user.DateRegistered ? new Date(user.DateRegistered).toISOString().split('T')[0] : 'N/A',
        };
      });
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getOfficials();
      
      // Transform officials data
      const transformedAdmins = response.data.map((official) => {
        // Build address from barangay info
        const address = [official.BarangayName, official.Municipality, official.Province]
          .filter(Boolean)
          .join(', ') || 'N/A';
        
        return {
          id: official.OfficialID,
          email: official.Email,
          phone: official.ContactNumber || 'N/A',
          address: address,
          barangayName: official.BarangayName || 'N/A',
          barangayId: official.BarangayID,
          status: official.Status || 'pending',
        };
      });
      setAdmins(transformedAdmins);
      
      // Build map of barangays with approved admins
      const adminMap = {};
      response.data.forEach((official) => {
        if (official.Status === 'approved' && official.BarangayID) {
          adminMap[official.BarangayID] = official.OfficialID;
        }
      });
      setBarangayAdminMap(adminMap);
      
      console.log('Officials:', response.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangays = async () => {
    try {
      const response = await getBarangays();
      console.log('Barangays fetched:', response.data);
      setBarangays(response.data);
    } catch (error) {
      console.error('Failed to fetch barangays:', error);
      setFormMessage('Failed to load barangays');
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await fetch('/api/contactus');
      if (!response.ok) throw new Error('Failed to fetch contact messages');
      const data = await response.json();
      setContactMessages(data);
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredContactMessages = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return contactMessages.filter((msg) => {
      const msgDate = new Date(msg.CreatedAt);
      const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

      if (contactMessageFilter === 'today') {
        return msgDay.getTime() === today.getTime();
      } else if (contactMessageFilter === 'week') {
        return msgDate >= oneWeekAgo;
      } else if (contactMessageFilter === 'month') {
        return msgDate >= oneMonthAgo;
      }
      return true; // 'all'
    }).filter(
      (msg) =>
        msg.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.Message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredContactMessages = getFilteredContactMessages();

  const handleApproveAdmin = async (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    
    // Check if barangay already has an approved admin
    if (admin.barangayId && barangayAdminMap[admin.barangayId]) {
      const existingAdminId = barangayAdminMap[admin.barangayId];
      alert(`This barangay (${admin.barangay}) already has an approved admin (${existingAdminId}). Only one admin per barangay is allowed.`);
      return;
    }
    
    try {
      console.log(`📝 Approving admin: ${adminId}`);
      const response = await fetch(`/api/officials/${adminId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve admin');
      }
      
      console.log('✅ Admin approved successfully');
      setAdmins((prev) =>
        prev.map((a) => (a.id === adminId ? { ...a, status: 'approved' } : a))
      );
      
      // Update barangay admin map
      if (admin.barangayId) {
        setBarangayAdminMap((prev) => ({ ...prev, [admin.barangayId]: adminId }));
      }
      
      alert('Admin approved successfully!');
    } catch (error) {
      console.error('❌ Error approving admin:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeclineAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to decline this admin application?')) {
      try {
        const response = await fetch(`/api/officials/${adminId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to decline admin');
        
        setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
      } catch (error) {
        console.error('Error declining admin:', error);
        alert('Failed to decline admin');
      }
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      try {
        const response = await fetch(`/api/officials/${adminId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete admin');
        
        setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
        
        // Rebuild barangay admin map after deletion
        const admin = admins.find((a) => a.id === adminId);
        if (admin?.barangayId && barangayAdminMap[admin.barangayId] === adminId) {
          setBarangayAdminMap((prev) => {
            const updated = { ...prev };
            delete updated[admin.barangayId];
            return updated;
          });
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user account?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete user');
        
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteContactMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this contact message?')) {
      try {
        const response = await fetch(`/api/contactus/${messageId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete message');
        
        setContactMessages((prev) => prev.filter((msg) => msg.ContactUsID !== messageId));
        alert('Message deleted successfully');
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBarangay = async (e) => {
    e.preventDefault();
    if (!formData.barangayName || !formData.municipality || !formData.province) {
      setFormMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await createBarangay(formData);
      console.log('Barangay created:', response);
      setFormMessage('Barangay added successfully!');
      setFormData({ barangayName: '', municipality: '', province: '' });
      fetchBarangays();
      setTimeout(() => setFormMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add barangay:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add barangay';
      setFormMessage('Error: ' + errorMsg);
    }
  };

  return (
    <div className="superadmin-homepage">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Super Admin</p>
          <h1>
            Account <span className="highlight">Management</span>
          </h1>
          <p className="dashboard-subtitle">Manage admin and user accounts across all barangays</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={handleRefreshData}
            disabled={refreshing}
            title="Refresh all data"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? 'spinning' : ''}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2-8.83" />
            </svg>
          </button>
          <button className="logout-btn" onClick={onLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-content">
            <h3 className="stat-label">Total Admins</h3>
            <p className="stat-value">{stats.totalAdmins}</p>
            <p className="stat-detail">{stats.approvedAdmins} approved • {stats.pendingAdmins} pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3 className="stat-label">Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <p className="stat-detail">citizen accounts</p>
          </div>
        </div>
      </div>

      <div className="tab-menu">
        <button
          className={`tab-menu-btn ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Admin Accounts
          <span className="tab-badge">{admins.length}</span>
        </button>
        <button
          className={`tab-menu-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          User Accounts
          <span className="tab-badge">{users.length}</span>
        </button>
        <button
          className={`tab-menu-btn ${activeTab === 'barangays' ? 'active' : ''}`}
          onClick={() => setActiveTab('barangays')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Add Barangay
          <span className="tab-badge">{barangays.length}</span>
        </button>
        <button
          className={`tab-menu-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Contact Messages
          <span className="tab-badge">{contactMessages.length}</span>
        </button>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="table-container">
        {activeTab === 'admins' && (
          <div className="table-section">
            <div className="section-header">
              <h2 className="section-title">Admin Accounts</h2>
              <span className="badge-count">{admins.length}</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-state">Loading admins...</div>
              ) : (
                <table className="accounts-table">
                   <thead>
                     <tr>
                       <th>Official ID</th>
                       <th>Address</th>
                       <th>Email</th>
                       <th>Contact Number</th>
                       <th>Status</th>
                       <th>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredAdmins.length === 0 ? (
                       <tr>
                         <td colSpan="6" className="empty-message">
                           No admin accounts found
                         </td>
                       </tr>
                     ) : (
                       filteredAdmins.map((admin) => {
                         const barangayHasAdmin = admin.barangayId && barangayAdminMap[admin.barangayId];
                         const isExistingAdmin = barangayHasAdmin && barangayAdminMap[admin.barangayId] !== admin.id;
                         return (
                         <tr key={admin.id} className={`status-${admin.status} ${isExistingAdmin ? 'conflict' : ''}`}>
                           <td className="id-cell">
                             <div className="id-info">
                               <p className="id">{admin.id}</p>
                             </div>
                           </td>
                           <td className="address-cell">
                             <div className="address-info">
                               <p>{admin.address}</p>
                               {barangayHasAdmin && (
                                 <span className="admin-conflict-badge" title="This barangay already has an approved admin">
                                   ⚠ Admin exists
                                 </span>
                               )}
                             </div>
                           </td>
                           <td className="email-cell">{admin.email}</td>
                           <td className="phone-cell">{admin.phone}</td>
                           <td>
                             <span className={`status-badge status-${admin.status}`}>
                               {admin.status}
                             </span>
                           </td>
                           <td>
                             <div className="action-buttons">
                               {admin.status === 'pending' && (
                                 <>
                                   <button
                                     className="btn-approve"
                                     onClick={() => handleApproveAdmin(admin.id)}
                                     title={isExistingAdmin ? 'Cannot approve: barangay already has an admin' : 'Approve this admin'}
                                     disabled={isExistingAdmin}
                                   >
                                     Approve
                                   </button>
                                   <button
                                     className="btn-decline"
                                     onClick={() => handleDeclineAdmin(admin.id)}
                                     title="Decline this admin"
                                   >
                                     Decline
                                   </button>
                                 </>
                               )}
                               <button
                                 className="btn-delete"
                                 onClick={() => handleDeleteAdmin(admin.id)}
                                 title="Delete this admin"
                               >
                                 Delete
                               </button>
                             </div>
                           </td>
                         </tr>
                         );
                       })
                     )}
                   </tbody>
                 </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-section">
            <div className="section-header">
              <h2 className="section-title">User Accounts</h2>
              <span className="badge-count">{users.length}</span>
            </div>
            <div className="table-wrapper">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>UserID</th>
                    <th>Full Name</th>
                    <th>Address</th>
                    <th>Email</th>
                    <th>Date Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-message">
                        No user accounts found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="id-cell">
                          <p className="id">{user.id}</p>
                        </td>
                        <td className="name-cell">
                          <p className="name">{user.name}</p>
                        </td>
                        <td className="address-cell">
                          <p className="address">{user.address}</p>
                        </td>
                        <td className="email-cell">
                          <p className="email">{user.email}</p>
                        </td>
                        <td className="date-cell">
                          <p className="date">{user.registeredDate}</p>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete this user"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'barangays' && (
          <div className="table-section">
            <div className="section-header">
              <h2 className="section-title">Add Barangay</h2>
              <span className="badge-count">{barangays.length}</span>
            </div>
            <div className="barangay-form-container">
              <form className="barangay-form" onSubmit={handleAddBarangay}>
                <div className="form-group">
                  <label htmlFor="barangayName">Barangay Name</label>
                  <input
                    type="text"
                    id="barangayName"
                    name="barangayName"
                    value={formData.barangayName}
                    onChange={handleInputChange}
                    placeholder="Enter barangay name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="municipality">Municipality</label>
                  <input
                    type="text"
                    id="municipality"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    placeholder="Enter municipality"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="province">Province</label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Enter province"
                    required
                  />
                </div>
                <button type="submit" className="btn-submit">
                  Add Barangay
                </button>
              </form>
              {formMessage && <p className={`form-message ${formMessage.includes('Error') ? 'error' : 'success'}`}>{formMessage}</p>}
            </div>

            <div className="barangays-list">
              <div className="sort-controls">
                <label htmlFor="sort-barangay">Sort by Name:</label>
                <select 
                  id="sort-barangay"
                  value={barangaySort} 
                  onChange={(e) => setBarangaySort(e.target.value)}
                  className="sort-select"
                >
                  <option value="asc">Ascending (A-Z)</option>
                  <option value="desc">Descending (Z-A)</option>
                </select>
              </div>
              <div className="barangay-list-header">
                <h3>Existing Barangays ({barangays.length})</h3>
              </div>
              {barangays.length === 0 ? (
                <p className="empty-message">No barangays found</p>
              ) : (
                <div className="barangays-grid">
                  {[...barangays]
                    .sort((a, b) => {
                      if (barangaySort === 'asc') {
                        return a.BarangayName.localeCompare(b.BarangayName);
                      } else {
                        return b.BarangayName.localeCompare(a.BarangayName);
                      }
                    })
                    .map((barangay) => (
                    <div key={barangay.BarangayID} className="barangay-card">
                      <h4>{barangay.BarangayName}</h4>
                      <p><strong>ID:</strong> {barangay.BarangayID}</p>
                      <p><strong>Municipality:</strong> {barangay.Municipality}</p>
                      <p><strong>Province:</strong> {barangay.Province}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="table-section">
            <div className="section-header">
              <h2 className="section-title">Contact Messages</h2>
              <span className="badge-count">{contactMessages.length}</span>
            </div>
            <div className="filter-controls">
              <label htmlFor="contact-filter">Filter by Date:</label>
              <select 
                id="contact-filter"
                value={contactMessageFilter} 
                onChange={(e) => setContactMessageFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Messages</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
              <span className="filter-result-count">{filteredContactMessages.length} message(s)</span>
            </div>
            <div className="table-wrapper">
              {contactMessages.length === 0 ? (
                <p className="empty-message">No contact messages found</p>
              ) : filteredContactMessages.length === 0 ? (
                <p className="empty-message">No messages match your filters</p>
              ) : (
                <table className="accounts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContactMessages.map((msg) => (
                      <tr key={msg.ContactUsID}>
                        <td className="name-cell">{msg.Name}</td>
                        <td className="email-cell">{msg.Email}</td>
                        <td className="phone-cell">{msg.Phone || 'N/A'}</td>
                        <td className="message-cell">
                          <p className="message-preview">{msg.Message}</p>
                        </td>
                        <td className="date-cell">
                          {new Date(msg.CreatedAt).toLocaleDateString()} {new Date(msg.CreatedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteContactMessage(msg.ContactUsID)}
                              title="Delete this message"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminHomepage;
