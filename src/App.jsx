import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import AuthUser from './pages/AuthUser.jsx';
import HomePageUser from './pages/HomePageUser.jsx';
import RequestUser from './pages/RequestUser.jsx';
import ConcernUser from './pages/ConcernUser.jsx';
import EmergencyUser from './pages/EmergencyUser.jsx';
import ProfileUser from './pages/ProfileUser.jsx';
import AdminStatistics from './pages/AdminStatistics.jsx';
import PostAdmin from './pages/PostAdmin.jsx';
import ManageRequest from './pages/ManageRequest.jsx';
import ManageConcern from './pages/ManageConcern.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SuperAdminHomepage from './pages/SuperAdminHomepage.jsx';

function App() {
  const [view, setView] = useState(() => {
    const userId = localStorage.getItem('userId');
    const savedView = localStorage.getItem('currentView');
    
    if (userId && savedView && savedView !== 'landing') {
      return savedView;
    }
    
    return 'landing';
  });

  const goToLogin = () => {
    setView('login');
    localStorage.setItem('currentView', 'login');
  };
  const goToAdminLogin = () => {
    setView('admin-login');
    localStorage.setItem('currentView', 'admin-login');
  };
  const goToLanding = () => {
    setView('landing');
    localStorage.setItem('currentView', 'landing');
  };
  const goToUserHome = () => {
    setView('home');
    localStorage.setItem('currentView', 'home');
  };
  const goToRequest = () => {
    setView('request');
    localStorage.setItem('currentView', 'request');
  };
  const goToConcern = () => {
    setView('concern');
    localStorage.setItem('currentView', 'concern');
  };
  const goToEmergency = () => {
    setView('emergency');
    localStorage.setItem('currentView', 'emergency');
  };
  const goToProfile = () => {
    setView('profile');
    localStorage.setItem('currentView', 'profile');
  };
  const goToAdminHome = () => {
    setView('admin-home');
    localStorage.setItem('currentView', 'admin-home');
  };
  const goToSuperAdmin = () => {
    setView('superadmin');
    localStorage.setItem('currentView', 'superadmin');
  };
  const goToHistory = () => {
    setView('history');
    localStorage.setItem('currentView', 'history');
  };

  const handleNavigate = (page) => {
    switch (page) {
      case 'home':
        goToUserHome();
        break;
      case 'request':
        goToRequest();
        break;
      case 'concern':
        goToConcern();
        break;
      case 'emergency':
        goToEmergency();
        break;
      case 'profile':
        goToProfile();
        break;
      case 'history':
        goToHistory();
        break;
      case 'admin-home':
        goToAdminHome();
        break;
      case 'statistics':
        setView('admin-statistics');
        localStorage.setItem('currentView', 'admin-statistics');
        break;
      case 'post':
        setView('admin-post');
        localStorage.setItem('currentView', 'admin-post');
        break;
      case 'manage-request':
        setView('admin-manage-request');
        localStorage.setItem('currentView', 'admin-manage-request');
        break;
      case 'manage-concern':
        setView('admin-manage-concern');
        localStorage.setItem('currentView', 'admin-manage-concern');
        break;
      case 'admin-history':
        setView('admin-history');
        localStorage.setItem('currentView', 'admin-history');
        break;
      default:
        break;
    }
  };

  return (
    <>
      {view === 'landing' && <LandingPage onNavigateLogin={goToLogin} onNavigateAdminLogin={goToAdminLogin} />}
      {view === 'login' && <AuthUser onBackHome={goToLanding} onLoginSuccess={goToUserHome} />}
      {view === 'admin-login' && (
        <AuthUser
          userType="admin"
          onBackHome={goToLanding}
          onLoginSuccess={(userType) => {
            if (userType === 'superadmin') {
              goToSuperAdmin();
            } else {
              goToAdminHome();
            }
          }}
        />
      )}
      {view === 'home' && <HomePageUser onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'request' && <RequestUser onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'concern' && <ConcernUser onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'emergency' && <EmergencyUser onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'profile' && <ProfileUser onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'history' && <HistoryPage userType="user" onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'admin-home' && <AdminStatistics onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'admin-statistics' && <AdminStatistics onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'admin-post' && <PostAdmin onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'admin-manage-request' && <ManageRequest onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'admin-manage-concern' && <ManageConcern onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'admin-history' && <HistoryPage userType="admin" onLogout={goToLanding} onNavigate={handleNavigate} />}
      {view === 'superadmin' && <SuperAdminHomepage onLogout={goToLanding} />}
    </>
  );
}

export default App;
