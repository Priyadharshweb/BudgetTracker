import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaChevronDown } from 'react-icons/fa';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './AfterLogin.css';
import { useAuth } from '../context/AuthContext';
import { authAPI, budgetAPI, transactionAPI } from '../services/api';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const logout = auth?.logout || (() => {});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [fullName, setFullName] = useState(''); // Store user full name
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState('dashboard');

  useEffect(() => {
    // Fetch current user info when component mounts
    const fetchUser = async () => {
      try {
        const response = await authAPI.getProfile();
        setFullName(response.data.name);
        setUserRole(response.data.role);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    };

    fetchUser();
    checkBudgetNotifications();
    
    // Start dancing animation on login
    setIsDancing(true);
    const danceTimer = setTimeout(() => {
      setIsDancing(false);
    }, 4500); // Animation runs for 4.5 seconds (1.5s * 3 iterations)

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUser();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      clearTimeout(danceTimer);
    };
  }, []);

  const checkBudgetNotifications = async () => {
    try {
      const [budgetResponse, transactionResponse] = await Promise.all([
        budgetAPI.getBudgets(),
        transactionAPI.getTransactions()
      ]);
      
      const budgets = budgetResponse.data || [];
      const transactions = transactionResponse.data || [];
      const newNotifications = [];
      
      budgets.forEach(budget => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category?.toLowerCase() === budget.category?.toLowerCase())
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const percentage = (spent / budget.amount) * 100;
        const remaining = budget.amount - spent;
        
        if (percentage >= 70 && percentage < 100) {
          newNotifications.push({
            id: `budget-${budget.id}`,
            message: `You're reaching your ${budget.category} budget limit!`,
            details: `Remaining: $${remaining.toFixed(2)}`,
            type: 'warning'
          });
        } else if (percentage >= 100) {
          newNotifications.push({
            id: `budget-${budget.id}`,
            message: `You've exceeded your ${budget.category} budget!`,
            details: `Over by: $${Math.abs(remaining).toFixed(2)}`,
            type: 'error'
          });
        }
      });
      
      setNotifications(newNotifications);
      if (newNotifications.length > 0) {
        setHasUnreadNotifications(true);
      }
    } catch (error) {
      console.error('Error checking budget notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // Clear all cached data
    localStorage.clear();
    // Replace current history entry and disable back button
    window.history.pushState(null, null, '/');
    window.history.pushState(null, null, '/');
    // Force navigation to home
    window.location.replace('/');
  };



  // const handleHome = () => navigate('/');
  // const handleFeatures = () => navigate('/features');
  // const handleAboutus = () => navigate('/aboutUs');
  const handleUserDash = () => {
    if (userRole === 'ADMIN') {
      navigate('/admin-dashboard');
      setAdminActiveTab('dashboard');
    } else {
      navigate('/userDashboard');
      checkBudgetNotifications();
    }
  };
  const handleTransaction=()=> {
    if (userRole === 'ADMIN') {
      navigate('/admin-transactions');
    } else {
      navigate('/transaction');
    }
  };
  const handleUsers=()=>{
    if (userRole === 'ADMIN') {
      navigate('/admin-dashboard');
      setAdminActiveTab('users');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="app-name">BudgetTracker</div>
        <ul className="nav-links">
          <li 
            onClick={handleUserDash} 
            style={{
              backgroundColor: (location.pathname === '/userDashboard' || (location.pathname === '/admin-dashboard' && adminActiveTab === 'dashboard')) ? 'rgb(52, 101, 109)' : 'transparent',
              color: (location.pathname === '/userDashboard' || (location.pathname === '/admin-dashboard' && adminActiveTab === 'dashboard')) ? 'white' : '#666',
              borderRadius: '25px',
              padding: '8px 16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            My Dashboard
          </li>
          <li 
            onClick={handleTransaction}
            style={{
              backgroundColor: (location.pathname === '/transaction' || location.pathname === '/admin-transactions') ? 'rgb(52, 101, 109)' : 'transparent',
              color: (location.pathname === '/transaction' || location.pathname === '/admin-transactions') ? 'white' : '#666',
              borderRadius: '25px',
              padding: '8px 16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            Transaction
          </li>
          {userRole === 'ADMIN' && (
            <li 
              onClick={handleUsers}
              style={{
                backgroundColor: (location.pathname === '/admin-dashboard' && adminActiveTab === 'users') ? 'rgb(52, 101, 109)' : 'transparent',
                color: (location.pathname === '/admin-dashboard' && adminActiveTab === 'users') ? 'white' : '#666',
                borderRadius: '25px',
                padding: '8px 16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              Users
            </li>
          )}
        </ul>
      </div>
      <div className="nav-right">
        <div style={{
          position: 'relative',
          cursor: 'pointer',
          marginRight: '15px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <NotificationsIcon 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                setHasUnreadNotifications(false);
              }
            }}
            style={{fontSize: '24px', color: '#34656D'}} 
            className={isDancing ? 'notification-dance' : ''}
          />
          {notifications.length > 0 && hasUnreadNotifications && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notifications.length}
            </span>
          )}
        </div>
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
        {showNotifications && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            <div style={{padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{margin: 0, color: '#34656D'}}>Notifications</h4>
              <button 
                onClick={() => setShowNotifications(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#6c757d',
                  cursor: 'pointer',
                  padding: '0',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            {notifications.length > 0 ? (
              <>
                {notifications.map(notification => (
                  <div key={notification.id} style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: notification.type === 'error' ? '#fff5f5' : '#fff8e1'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: notification.type === 'error' ? '#dc3545' : '#ff9800',
                      marginBottom: '4px'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{fontSize: '12px', color: '#6c757d'}}>
                      {notification.details}
                    </div>
                  </div>
                ))}
                <div style={{padding: '10px 15px', borderTop: '1px solid #eee'}}>
                  <button 
                    onClick={() => {
                      setNotifications([]);
                      setHasUnreadNotifications(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </>
            ) : (
              <div style={{padding: '20px', textAlign: 'center', color: '#6c757d'}}>
                No notifications
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNav;
