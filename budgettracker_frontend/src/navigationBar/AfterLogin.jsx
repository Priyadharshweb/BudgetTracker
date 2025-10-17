import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaChevronDown } from 'react-icons/fa';
import './AfterLogin.css';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AfterLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const logout = auth?.logout || (() => {});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [fullName, setFullName] = useState(''); // Store user full name

  useEffect(() => {
    // Fetch current user info when component mounts
    const fetchUser = async () => {
      try {
        const response = await authAPI.getProfile();
        setFullName(response.data.name);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    };

    fetchUser();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUser();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', preventBack);
  };

  const preventBack = () => {
    window.history.pushState(null, null, window.location.pathname);
  };

  const handleHome = () => navigate('/');
  const handleFeatures = () => navigate('/features');
  const handleAboutus = () => navigate('/aboutUs');
  const handleUserDash = () => navigate('/userDashboard');
  const handleTransaction=()=> navigate('/transaction')

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="app-name">BudgetTracker</div>
        <ul className="nav-links">
          <li onClick={handleHome}>Home</li>
          <li onClick={handleFeatures}>Features</li>
          <li onClick={handleAboutus}>About Us</li>
          <li onClick={handleUserDash} className={location.pathname === '/userDashboard' ? 'active' : ''}>My Dashboard</li>
          <li onClick={handleTransaction}>Transaction</li>
          <li>Cards</li>
          <li>Bank accounts</li>
          <li>Notifications</li>
        </ul>
      </div>
      <div className="nav-right">
        <div className="profile-container">
          <button className="profile-btn" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div className="profile-avatar">👤</div>
            <span className="username">{fullName || 'User'}</span>
            <FaChevronDown className="dropdown-arrow" />
          </button>
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <button className="dropdown-option" onClick={() => navigate('/editProfile')}>Settings</button>
              <button className="dropdown-option" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AfterLogin;
