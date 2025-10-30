import React, { useState, useEffect } from 'react';
import AfterLogin from '../navigationBar/AfterLogin';
import { FaWallet, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, budgetAPI, savingsAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, LabelList } from 'recharts';
import './UserDashboard.css';
import Footer from '../components/Footer';

const UserDashboard = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated || false;
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [dateRange, setDateRange] = useState('Oct 01, 2025 – Oct 31, 2025');
  const [showCalendar, setShowCalendar] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);

  const handleTransaction=()=>{
    navigate('/transaction')
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      // Clear previous user's data
      setTransactions([]);
      setBudgets([]);
      setSavings([]);
      fetchTransactions();
      fetchBudgets();
      fetchSavings();
    }
  }, [isAuthenticated, navigate]);

  // Refresh data when component mounts or user changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      setTransactions([]);
      setBudgets([]);
      setSavings([]);
      fetchTransactions();
      fetchBudgets();
      fetchSavings();
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching transactions with token:', token ? 'Present' : 'Missing');
      
      const response = await transactionAPI.getTransactions();
      console.log('Received transactions:', response.data?.length || 0, 'items');
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      setTransactions([]);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getBudgets();
      setBudgets(response.data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error.message);
      setBudgets([]);
    }
  };

  const fetchSavings = async () => {
    try {
      console.log('Fetching savings data...');
      const response = await savingsAPI.getSavings();
      console.log('Savings response:', response.data);
      setSavings(response.data || []);
    } catch (error) {
      console.error('Error fetching savings:', error.message);
      setSavings([]);
    }
  };

  const calculateSummary = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const walletBalance = totalIncome - totalExpenses;
    const periodChange = walletBalance;
    
    return { totalIncome, totalExpenses, walletBalance, periodChange };
  };

  const { totalIncome, totalExpenses, walletBalance, periodChange } = calculateSummary();

  const getCategoryExpenses = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(transaction.amount);
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      count: expenseTransactions.filter(t => (t.category || 'Other') === category).length
    })).sort((a, b) => b.amount - a.amount);
  };

  const categoryExpenses = getCategoryExpenses();

  const getMonthlyData = () => {
    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expenses: 0 };
      if (t.type === 'income') monthlyData[month].income += parseFloat(t.amount);
      else monthlyData[month].expenses += parseFloat(t.amount);
    });
    return Object.values(monthlyData);
  };

  const getPieData = () => {
    return categoryExpenses.map(cat => ({ name: cat.category, value: cat.amount }));
  };

  const getBudgetProgressData = () => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category?.toLowerCase() === budget.category?.toLowerCase())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return {
        category: budget.category,
        budget: budget.amount,
        spent: spent,
        remaining: Math.max(0, budget.amount - spent)
      };
    });
  };

  const getSavingsData = () => {
    const monthlyData = {};
    let runningBalance = 0;
    
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) monthlyData[month] = { month, savings: runningBalance };
      
      if (t.type === 'income') runningBalance += parseFloat(t.amount);
      else runningBalance -= parseFloat(t.amount);
      
      monthlyData[month].savings = runningBalance;
    });
    
    return Object.values(monthlyData);
  };

  const getDailyTransactionData = () => {
    const dailyData = {};
    transactions.forEach(t => {
      const day = new Date(t.date).getDate();
      dailyData[day] = (dailyData[day] || 0) + 1;
    });
    
    return Object.entries(dailyData).map(([day, count]) => ({ day: parseInt(day), count })).sort((a, b) => a.day - b.day);
  };

  const getSavingsSummary = () => {
    console.log('Current savings data:', savings);
    const totalTarget = savings.reduce((sum, s) => sum + (s.target_amt || 0), 0);
    const totalSaved = savings.reduce((sum, s) => sum + (s.curr_amt || 0), 0);
    const activeGoals = savings.length;
    
    console.log('Savings summary:', { totalTarget, totalSaved, activeGoals });
    return { totalTarget, totalSaved, activeGoals };
  };

  const COLORS = ['#34656D', '#6c757d', '#8d9499', '#adb5bd', '#495057', '#28a745', '#17a2b8', '#ffc107'];

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      travel: '✈️',
      bill: '📄',
      home: '🏠',
      car: '🚗',
      family: '👨‍👩‍👧‍👦',
      personal: '👤',
      other: '📦'
    };
    return icons[category.toLowerCase()] || '📦';
  };

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
            <div onClick={handleTransaction}>
              <div className="wallet-title">Cash Wallet</div>
              <div className="wallet-subtitle">Cash</div>
              <div className="wallet-amount" style={{color: walletBalance >= 0 ? '#16c784' : '#dc3545'}}>{walletBalance >= 0 ? '+' : ''}₹{walletBalance.toFixed(2)}</div>
            </div>
          </div>

          <div className="wallet-buttons">
            <button className="wallet-btn">Add New Wallet</button>
            <button className="wallet-btn">Connect a Bank Account</button>
          </div>

          <div className="savings-goals-section" style={{marginTop: '20px'}}>
            <h3 style={{color: '#34656D', marginBottom: '15px', fontSize: '18px'}}>Current Savings Goals</h3>
            <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 8px rgba(52, 101, 109, 0.1)'}}>
              {savings.length > 0 ? (
                <>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px', color: '#6c757d'}}>Active Goals</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#34656D'}}>{getSavingsSummary().activeGoals}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px', color: '#6c757d'}}>Total Target</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#34656D'}}>₹{getSavingsSummary().totalTarget.toFixed(2)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '14px', color: '#6c757d'}}>Total Saved</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#28a745'}}>₹{getSavingsSummary().totalSaved.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div style={{textAlign: 'center', padding: '20px', color: '#6c757d'}}>
                  <p style={{margin: '0 0 10px 0', fontSize: '14px'}}>No savings goals yet</p>
                  <p style={{margin: '0', fontSize: '12px'}}>Create your first savings goal to start tracking your progress</p>
                </div>
              )}
              <button 
                onClick={() => navigate('/savings')}
                style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '8px',
                  backgroundColor: '#34656D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {savings.length > 0 ? 'View All Goals' : 'Create Savings Goal'}
              </button>
            </div>
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
                <span className={`balance-amount ${walletBalance >= 0 ? 'positive' : 'negative'}`}>{walletBalance >= 0 ? '+' : ''}₹{walletBalance.toFixed(2)}</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Total Period Change</span>
                <span className={`balance-amount ${periodChange >= 0 ? 'positive' : 'negative'}`}>{periodChange >= 0 ? '+' : ''}₹{periodChange.toFixed(2)}</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Total Period Expenses</span>
                <span className="balance-amount negative">₹{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Total Period Income</span>
                <span className="balance-amount positive">+₹{totalIncome.toFixed(2)}</span>
              </div>
            </div>

            <div className="charts-overview" style={{marginTop: '30px'}}>
              <h3 style={{marginBottom: '20px', color: '#34656D'}}>Financial Overview</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                
                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Monthly Spending Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="expenses" stroke="#dc3545" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Income vs Expenses</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#28a745" />
                      <Bar dataKey="expenses" fill="#dc3545" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Category Distribution for Expenses</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie 
                        data={getPieData()} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={60} 
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {getPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Budget Progress</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getBudgetProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="budget" fill="#34656D" name="Budget" />
                      <Bar dataKey="spent" fill="#dc3545" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Savings Growth</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={getSavingsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="savings" stroke="#28a745" strokeWidth={3} fill="#28a745" fillOpacity={0.3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Transaction Frequency</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getDailyTransactionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#17a2b8" name="Transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>



            <div className="expenses-section">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3>Period Expenses ({selectedPeriod})</h3>
                <div className="date-dropdown-container" style={{position: 'relative'}}>
                  <button 
                    className="date-range"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="calendar-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path>
                    </svg>
                    {dateRange}
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="dropdown-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="date-dropdown" style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '150px'
                    }}>
                      {periods.map((period) => (
                        <button
                          key={period.value}
                          className={`dropdown-item ${selectedPeriod === period.label ? 'active' : ''}`}
                          onClick={() => handlePeriodSelect(period)}
                          style={{
                            width: '100%',
                            padding: '10px 15px',
                            border: 'none',
                            backgroundColor: selectedPeriod === period.label ? '#f0f0f0' : 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {categoryExpenses.length > 0 ? (
                categoryExpenses.map((categoryData) => (
                  <div key={categoryData.category} className="expense-item">
                    <div className="expense-icon">{getCategoryIcon(categoryData.category)}</div>
                    <div className="expense-details">
                      <span className="expense-category">{categoryData.category.charAt(0).toUpperCase() + categoryData.category.slice(1)}</span>
                      <span className="expense-transactions">{categoryData.count} transaction{categoryData.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="expense-amount">₹{categoryData.amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="transactions-list">
                  <p className="no-transactions">No transactions found for {selectedPeriod.toLowerCase()}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
