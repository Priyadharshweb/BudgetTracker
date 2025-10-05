import React, { useState } from 'react';
import AfterLogin from '../navigationBar/AfterLogin';
import { FaWallet, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';

import './UserDashboard.css'; // Import CSS

const UserDashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [dateRange, setDateRange] = useState('Oct 01, 2025 – Oct 31, 2025');
  const [showCalendar, setShowCalendar] = useState(false);

  const periods = [
    { label: 'Last Week', value: 'last-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Year', value: 'this-year' },
    { label: 'Last Year', value: 'last-year' },
    { label: 'Calendar View', value: 'calendar' }
  ];

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period.label);
    setShowDropdown(false);
    
    if (period.value === 'calendar') {
      setShowCalendar(true);
      return;
    }
    
    const today = new Date();
    let startDate, endDate;
    
    switch(period.value) {
      case 'last-week': {
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay());
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      }
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'this-year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'last-year':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };
    
    setDateRange(`${formatDate(startDate)} – ${formatDate(endDate)}`);
  };

  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };
  return (
    <>
      <AfterLogin />
      <div className="wallet-container">
        <div className="wallet-left">
          <div className="wallet-card">
            <div className="wallet-icon">
              <FaWallet size={30} color="#A26D3F" />
            </div>
            <div>
              <div className="wallet-title">Cash Wallet</div>
              <div className="wallet-subtitle">Cash</div>
              <div className="wallet-amount">0.00 USD</div>
            </div>
          </div>

          <div className="wallet-buttons">
            <button className="wallet-btn">Add New Wallet</button>
            <button className="wallet-btn">Connect a Bank Account</button>
          </div>
        </div>

        <div className="wallet-divider" />

        <div className="wallet-right">
          <section>
            <div className="overview-header">
              <h2>Overview</h2>
            </div>
            <div className="date-selector">
              <button className="date-nav">‹</button>
              <div className="date-dropdown-container">
                <button 
                  className="date-range" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FaCalendarAlt className="calendar-icon" />
                  {dateRange}
                  <FaChevronDown className="dropdown-icon" />
                </button>
                {showDropdown && (
                  <div className="date-dropdown">
                    {periods.map((period) => (
                      <button
                        key={period.value}
                        className={`dropdown-item ${selectedPeriod === period.label ? 'active' : ''}`}
                        onClick={() => handlePeriodSelect(period)}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                )}
                {showCalendar && (
                  <div className="calendar-view">
                    <div className="calendar-header">
                      <h4>October 2025</h4>
                      <button onClick={() => setShowCalendar(false)}>×</button>
                    </div>
                    <div className="calendar-grid">
                      <div className="calendar-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="weekday">{day}</div>
                        ))}
                      </div>
                      <div className="calendar-days">
                        {generateCalendar().map((day, index) => (
                          <div key={index} className={`calendar-day ${day ? 'active' : 'empty'}`}>
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button className="date-nav">›</button>
            </div>
            
            <div className="balance-cards">
              <div className="balance-card">
                <span className="balance-label">Total Balance</span>
                <span className="balance-amount negative">0.00 USD</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Total Period Change</span>
                <span className="balance-amount negative">0.00 USD</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Total Period Expenses</span>
                <span className="balance-amount negative">0.00 USD</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Total Period Income</span>
                <span className="balance-amount positive">0.00 USD</span>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-container">
                <h3>Account Balance</h3>
                <div className="chart-placeholder">Chart will be displayed here</div>
              </div>
              <div className="chart-container">
                <h3>Changes</h3>
                <div className="chart-placeholder">Chart will be displayed here</div>
              </div>
            </div>

            <div className="expenses-section">
              <h3>Period Expenses ({selectedPeriod})</h3>
              <div className="expense-item">
                <div className="expense-icon">🍽️</div>
                <div className="expense-details">
                  <span className="expense-category">Food & Drink</span>
                  <span className="expense-transactions">0 transactions</span>
                </div>
                <span className="expense-amount">0.00 USD</span>
              </div>
              <div className="transactions-list">
                <p className="no-transactions">No transactions found for {selectedPeriod.toLowerCase()}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
