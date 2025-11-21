import React, { useState, useEffect } from 'react';
import AfterLogin from '../navigationBar/AfterLogin';
import { FaWallet, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, budgetAPI, savingsAPI, forumAPI, commentsAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, LabelList } from 'recharts';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ReplyIcon from '@mui/icons-material/Reply';
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newCommand, setNewCommand] = useState('');
  const [commands, setCommands] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showReplyFor, setShowReplyFor] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [postLikes, setPostLikes] = useState({});
  const [postReplies, setPostReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [showAIModal, setShowAIModal] = useState(false);
  const [activeAITab, setActiveAITab] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleTransaction=()=>{
    navigate('/transaction')
  }

  const handleExportCSV = (type) => {
    let data = [];
    let filename = '';
    
    if (type === 'transactions') {
      data = transactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type,
        Category: t.category,
        Amount: t.amount,
        Description: t.description || t.note
      }));
      filename = 'transactions.csv';
    } else if (type === 'budgets') {
      data = budgets.map(b => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category?.toLowerCase() === b.category?.toLowerCase())
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return {
          Category: b.category,
          Budget: b.amount,
          Spent: spent,
          Remaining: Math.max(0, b.amount - spent),
          'Usage %': ((spent / b.amount) * 100).toFixed(1)
        };
      });
      filename = 'budgets.csv';
    } else if (type === 'savings') {
      data = savings.map(s => ({
        'Goal Name': s.goal_name,
        'Target Amount': s.target_amt,
        'Current Amount': s.curr_amt,
        'Progress %': ((s.curr_amt / s.target_amt) * 100).toFixed(1),
        Deadline: new Date(s.deadline).toLocaleDateString()
      }));
      filename = 'savings.csv';
    }
    
    if (data.length === 0) {
      alert(`No ${type} data available to export`);
      return;
    }
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData);
        
        // Check user role and redirect if admin
        if (userData.role === 'ADMIN') {
          navigate('/admin-dashboard', { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const loadCommands = async () => {
    try {
      const response = await forumAPI.getAllPosts();
      const sortedCommands = (response.data || []).sort((a, b) => new Date(b.created) - new Date(a.created));
      setCommands(sortedCommands);
      
      // Load user's likes from localStorage
      const currentUser = userProfile?.id || 'anonymous';
      const userLikes = new Set();
      const likes = {};
      
      sortedCommands.forEach(command => {
        const likeKey = `${currentUser}_${command.id}`;
        if (localStorage.getItem(`like_${likeKey}`)) {
          userLikes.add(command.id);
        }
        // Count total likes for this post from all users
        let totalLikes = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`like_`) && key.endsWith(`_${command.id}`)) {
            totalLikes++;
          }
        }
        likes[command.id] = totalLikes;
      });
      
      setLikedPosts(userLikes);
      setPostLikes(likes);
      
      // Load replies for each post
      sortedCommands.forEach(command => {
        loadRepliesForPost(command.id);
      });
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  };

  const handleSubmitCommand = async () => {
    if (newCommand.trim()) {
      try {
        await forumAPI.createPost({
          title: 'User Query',
          content: newCommand,
          created: new Date().toISOString()
        });
        setNewCommand('');
        loadCommands();
      } catch (error) {
        console.error('Error posting command:', error);
      }
    }
  };

  const handleLike = (id) => {
    const currentUser = userProfile?.id || 'anonymous';
    const likeKey = `${currentUser}_${id}`;
    
    if (likedPosts.has(id)) {
      // Unlike
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setPostLikes(prev => ({
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) - 1)
      }));
      localStorage.removeItem(`like_${likeKey}`);
    } else {
      // Like
      setLikedPosts(prev => new Set([...prev, id]));
      setPostLikes(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }));
      localStorage.setItem(`like_${likeKey}`, 'true');
    }
  };

  const handleReply = async (id) => {
    if (replyText.trim()) {
      try {
        await commentsAPI.createComment({
          postId: id,
          comments: replyText,
          createdAs: new Date().toISOString()
        });
        setReplyText('');
        setShowReplyFor(null);
        loadRepliesForPost(id);
      } catch (error) {
        console.error('Error posting reply:', error);
        alert('Failed to post reply. Please try again.');
      }
    }
  };

  const loadRepliesForPost = async (postId) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [postId]: true }));
      const response = await commentsAPI.getComments(postId);
      setPostReplies(prev => ({
        ...prev,
        [postId]: response.data || []
      }));
    } catch (error) {
      console.error('Error loading replies:', error);
      setPostReplies(prev => ({ ...prev, [postId]: [] }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAIChat = () => {
    if (!currentQuestion.trim()) return;
    
    const question = currentQuestion.toLowerCase();
    let answer = '';
    
    // Financial advice based on user data
    if (question.includes('save') || question.includes('saving')) {
      const savingsRate = totalIncome > 0 ? ((walletBalance / totalIncome) * 100) : 0;
      answer = `Based on your data, you're saving ${savingsRate.toFixed(1)}% of your income. I recommend saving at least 20%. Try reducing your ${categoryExpenses[0]?.category || 'top'} expenses by ₹${(categoryExpenses[0]?.amount * 0.2 || 1000).toFixed(0)} monthly.`;
    } else if (question.includes('budget') || question.includes('spending')) {
      answer = `Your monthly spending is ₹${totalExpenses.toFixed(0)}. Your biggest expense is ${categoryExpenses[0]?.category || 'unknown'} (₹${categoryExpenses[0]?.amount?.toFixed(0) || 0}). Consider using the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`;
    } else if (question.includes('income') || question.includes('earn')) {
      answer = `Your current income is ₹${totalIncome.toFixed(0)}. To increase it: 1) Ask for a raise, 2) Start freelancing, 3) Learn new skills, 4) Consider a side business. Even a 10% increase would give you ₹${(totalIncome * 0.1).toFixed(0)} more monthly.`;
    } else if (question.includes('expense') || question.includes('cost')) {
      const topCategory = categoryExpenses[0];
      answer = `Your top expense category is ${topCategory?.category || 'unknown'} at ₹${topCategory?.amount?.toFixed(0) || 0}. To reduce it: track daily spending, set category limits, compare prices, and avoid impulse purchases.`;
    } else if (question.includes('debt') || question.includes('loan')) {
      answer = `If you have debt, prioritize high-interest debt first. With your current balance of ₹${walletBalance.toFixed(0)}, consider the debt avalanche method: pay minimums on all debts, then extra on highest interest rate debt.`;
    } else if (question.includes('investment') || question.includes('invest')) {
      answer = `Before investing, ensure you have 3-6 months emergency fund. With your savings rate of ${totalIncome > 0 ? ((walletBalance / totalIncome) * 100).toFixed(1) : 0}%, consider starting with SIP in mutual funds or index funds for long-term wealth building.`;
    } else if (question.includes('emergency') || question.includes('fund')) {
      const emergencyNeeded = totalExpenses * 6;
      answer = `You need ₹${emergencyNeeded.toFixed(0)} for a 6-month emergency fund (6x your monthly expenses). Currently you have ₹${walletBalance.toFixed(0)}. ${walletBalance >= emergencyNeeded ? 'Great! You have enough.' : `You need ₹${(emergencyNeeded - walletBalance).toFixed(0)} more.`}`;
    } else if (question.includes('goal') || question.includes('target')) {
      answer = `Set SMART financial goals: Specific, Measurable, Achievable, Relevant, Time-bound. Based on your income of ₹${totalIncome.toFixed(0)}, you could save ₹${(totalIncome * 0.2).toFixed(0)} monthly for goals like vacation, house down payment, or retirement.`;
    } else {
      answer = `I can help with budgeting, saving, investing, debt management, and financial planning. Try asking: "How can I save more?", "What's my biggest expense?", "How much should I invest?", or "Do I have enough emergency fund?"`;
    }
    
    const newMessage = {
      question: currentQuestion,
      answer: answer
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentQuestion('');
  };



  const handleExportPDF = (type) => {
    // Simple PDF export using window.print with formatted content
    let content = '';
    
    if (type === 'transactions') {
      content = `
        <h2>Transaction History</h2>
        <table border="1" style="width:100%; border-collapse:collapse;">
          <tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Description</th></tr>
          ${transactions.map(t => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString()}</td>
              <td>${t.type}</td>
              <td>${t.category}</td>
              <td>₹${t.amount}</td>
              <td>${t.description || t.note || ''}</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (type === 'budgets') {
      content = `
        <h2>Budget Report</h2>
        <table border="1" style="width:100%; border-collapse:collapse;">
          <tr><th>Category</th><th>Budget</th><th>Spent</th><th>Remaining</th><th>Usage %</th></tr>
          ${budgets.map(b => {
            const spent = transactions
              .filter(t => t.type === 'expense' && t.category?.toLowerCase() === b.category?.toLowerCase())
              .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            return `
              <tr>
                <td>${b.category}</td>
                <td>₹${b.amount}</td>
                <td>₹${spent.toFixed(2)}</td>
                <td>₹${Math.max(0, b.amount - spent).toFixed(2)}</td>
                <td>${((spent / b.amount) * 100).toFixed(1)}%</td>
              </tr>
            `;
          }).join('')}
        </table>
      `;
    } else if (type === 'savings') {
      content = `
        <h2>Savings Goals Report</h2>
        <table border="1" style="width:100%; border-collapse:collapse;">
          <tr><th>Goal Name</th><th>Target</th><th>Current</th><th>Progress %</th><th>Deadline</th></tr>
          ${savings.map(s => `
            <tr>
              <td>${s.goal_name}</td>
              <td>₹${s.target_amt}</td>
              <td>₹${s.curr_amt}</td>
              <td>${((s.curr_amt / s.target_amt) * 100).toFixed(1)}%</td>
              <td>${new Date(s.deadline).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Budget Tracker Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { margin-top: 20px; }
            th { background-color: #34656D; color: white; padding: 10px; }
            td { padding: 8px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    setShowExportModal(false);
  };

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
      fetchUserProfile(); // Check role first
      setTransactions([]);
      setBudgets([]);
      setSavings([]);
      fetchTransactions();
      fetchBudgets();
      fetchSavings();
      loadCommands();
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

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

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
            <button className="wallet-btn" onClick={() => setShowExportModal(true)}>Export</button>
            <button className="wallet-btn" onClick={() => setShowChatModal(true)}>Chat and Queries</button>
          </div>

          <div className="savings-goals-section" style={{marginTop: '20px'}}>
            <h3 style={{color: '#34656D', marginBottom: '15px', fontSize: '18px'}}>Current Savings Goals</h3>
            <div style={{backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 8px rgba(52, 101, 109, 0.1)'}}>
              {savings.length > 0 ? (
                <>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px', color: '#6c757d'}}>Active Goals</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#ffffffff'}}>{getSavingsSummary().activeGoals}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px', color: '#6c757d'}}>Total Target</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#ffffffff'}}>₹{getSavingsSummary().totalTarget.toFixed(2)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontSize: '14px', color: '#6c757d'}}>Total Saved</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: '#ff0000ff'}}>₹{getSavingsSummary().totalSaved.toFixed(2)}</span>
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
            <div className="overview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Overview</h2>
              <button
                onClick={() => setShowAIModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#34656D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(52, 101, 109, 0.3)'
                }}
              >
                🤖 Quick Assistant AI
              </button>
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
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="expenses" stroke="#dc3545" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Income vs Expenses</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#28a745" />
                      <Bar dataKey="expenses" fill="#dc3545" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '10px'}}>Category Distribution for Expenses</h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                      <Pie 
                        data={getPieData()} 
                        cx="50%" 
                        cy="50%" 
                        labelLine
                        label={(props) => {
                          const { name, percent } = props;
                          return (
                            <text 
                              x={props.x} 
                              y={props.y} 
                              fill="#34656D" 
                              textAnchor={props.x > props.cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              fontSize="12"
                              fontWeight="500"
                            >
                              {`${name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {getPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`₹${value.toFixed(2)}`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Budget Progress</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getBudgetProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={1} />
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
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={getSavingsData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={1} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="savings" stroke="#28a745" strokeWidth={3} fill="#28a745" fillOpacity={0.3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'}}>
                  <h4 style={{color: '#34656D', marginBottom: '15px'}}>Transaction Frequency</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getDailyTransactionData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={1} />
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

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '95%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ color: '#34656D', margin: 0 }}>Export Data</h3>
              <button 
                onClick={() => setShowExportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              marginBottom: '25px',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              <div>Export your financial data in CSV format for spreadsheet analysis or PDF format for reports.</div>
              <div>Hover over the info icons (i) next to each button for detailed instructions.</div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              {/* CSV Downloads */}
              <div style={{
                border: '2px solid #34656D',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#34656D', marginBottom: '15px' }}>Download as CSV</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleExportCSV('transactions')}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                    >
                      Transactions
                    </button>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setShowTooltip('csv-transactions')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      i
                      {showTooltip === 'csv-transactions' && (
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1001
                        }}>
                          Downloads Excel-compatible file with all transaction data
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleExportCSV('budgets')}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                    >
                      Budgets
                    </button>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setShowTooltip('csv-budgets')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      i
                      {showTooltip === 'csv-budgets' && (
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1001
                        }}>
                          Downloads budget report with spending analysis
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleExportCSV('savings')}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                    >
                      Savings Goals
                    </button>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setShowTooltip('csv-savings')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      i
                      {showTooltip === 'csv-savings' && (
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1001
                        }}>
                          Downloads savings goals with progress tracking
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* PDF Downloads */}
              <div style={{
                border: '2px solid #dc3545',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>Download as PDF</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleExportPDF('transactions')}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                    >
                      Transactions
                    </button>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setShowTooltip('pdf-transactions')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      i
                      {showTooltip === 'pdf-transactions' && (
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1001
                        }}>
                          Opens print dialog to save as PDF document
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleExportPDF('budgets')}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                    >
                      Budgets
                    </button>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setShowTooltip('pdf-budgets')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      i
                      {showTooltip === 'pdf-budgets' && (
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1001
                        }}>
                          Generates formatted PDF report for printing
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleExportPDF('savings')}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                    >
                      Savings Goals
                    </button>
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setShowTooltip('pdf-savings')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      i
                      {showTooltip === 'pdf-savings' && (
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#333',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          zIndex: 1001
                        }}>
                          Creates printable savings goals summary
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#666'
            }}>
              Choose your preferred format to download transaction history, budget reports, or savings goals data.
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Popup */}
      {showAIModal && (
        <div style={{
          position: 'fixed',
          top: '5%',
          right: '2%',
          width: '45vw',
          height: '85vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'slideIn 0.4s ease-out',
          overflow: 'hidden'
        }}>
          <style>
            {`
              @keyframes slideIn {
                from { transform: translateX(100%) scale(0.8); opacity: 0; }
                to { transform: translateX(0) scale(1); opacity: 1; }
              }
            `}
          </style>
          
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>🤖</div>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>AI Financial Assistant</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '12px' }}>Smart insights & predictions</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            {[{name: 'Tips', icon: '💡'}, {name: 'Alerts', icon: '⚠️'}, {name: 'Health', icon: '📊'}, {name: 'Chat', icon: '💬'}].map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setActiveAITab(index)}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  border: 'none',
                  background: activeAITab === index ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: activeAITab === index ? 'bold' : 'normal',
                  transition: 'all 0.3s ease',
                  borderBottom: activeAITab === index ? '2px solid white' : '2px solid transparent'
                }}
              >
                <div>{tab.icon}</div>
                <div>{tab.name}</div>
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div style={{
            padding: '20px',
            height: 'calc(100% - 140px)',
            overflowY: 'auto',
            background: 'white',
            margin: '10px',
            borderRadius: '15px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {activeAITab === 0 && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '15px',
                  borderRadius: '12px',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>💡 Smart Financial Tips</h4>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Personalized recommendations for you</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                    borderRadius: '10px',
                    border: '2px solid #e0f2f1'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>💰</span>
                      <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>Save 20% of income monthly</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
                    borderRadius: '10px',
                    border: '2px solid #fff3e0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📊</span>
                      <span style={{ fontWeight: 'bold', color: '#e65100' }}>Use 50/30/20 budgeting rule</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)', 
                    borderRadius: '10px',
                    border: '2px solid #e8f5e8'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📱</span>
                      <span style={{ fontWeight: 'bold', color: 'white' }}>Track daily expenses</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 
                    borderRadius: '10px',
                    border: '2px solid #ffebee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🍽️</span>
                      <span style={{ fontWeight: 'bold', color: '#c62828' }}>Reduce {categoryExpenses[0]?.category || 'top'} spending</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeAITab === 1 && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
                  padding: '15px',
                  borderRadius: '12px',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>⚠️ Budget Alerts</h4>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Real-time spending warnings</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {budgets.filter(b => {
                    const spent = transactions.filter(t => t.type === 'expense' && t.category?.toLowerCase() === b.category?.toLowerCase()).reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    return (spent / b.amount) > 0.8;
                  }).length > 0 ? (
                    budgets.filter(b => {
                      const spent = transactions.filter(t => t.type === 'expense' && t.category?.toLowerCase() === b.category?.toLowerCase()).reduce((sum, t) => sum + parseFloat(t.amount), 0);
                      return (spent / b.amount) > 0.8;
                    }).map((budget, index) => {
                      const spent = transactions.filter(t => t.type === 'expense' && t.category?.toLowerCase() === budget.category?.toLowerCase()).reduce((sum, t) => sum + parseFloat(t.amount), 0);
                      const percentage = ((spent / budget.amount) * 100).toFixed(0);
                      return (
                        <div key={index} style={{ 
                          padding: '12px', 
                          background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', 
                          borderRadius: '10px',
                          border: '2px solid #ffcdd2'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>🚨</span>
                            <span style={{ fontWeight: 'bold', color: '#c62828' }}>{budget.category}: {percentage}% used</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ 
                      padding: '15px', 
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '2px solid #c8e6c9'
                    }}>
                      <span style={{ fontSize: '16px' }}>✅</span>
                      <div style={{ fontWeight: 'bold', color: '#2e7d32', marginTop: '5px' }}>All budgets are healthy!</div>
                    </div>
                  )}
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
                    borderRadius: '10px',
                    border: '2px solid #fff3e0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📈</span>
                      <span style={{ fontWeight: 'bold', color: '#e65100' }}>Next month: ₹{(totalExpenses * 1.1).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeAITab === 2 && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  padding: '15px',
                  borderRadius: '12px',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>📊 Financial Health</h4>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Your financial wellness score</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>💹 Savings Rate</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      background: 'rgba(255,255,255,0.8)', 
                      padding: '4px 12px', 
                      borderRadius: '15px',
                      color: '#2e7d32'
                    }}>
                      {totalIncome > 0 ? ((walletBalance / totalIncome) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: ((walletBalance / totalIncome) * 100) > 20 ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>🎯 Status</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      background: 'rgba(255,255,255,0.8)', 
                      padding: '4px 12px', 
                      borderRadius: '15px'
                    }}>
                      {((walletBalance / totalIncome) * 100) > 20 ? '🌟 Excellent' : ((walletBalance / totalIncome) * 100) > 10 ? '👍 Good' : '⚠️ Needs Work'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    padding: '15px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏆</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Overall Score</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>
                      {totalIncome > 0 && walletBalance > 0 ? '85/100' : '45/100'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeAITab === 3 && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '15px',
                  borderRadius: '12px',
                  color: 'white',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>💬 AI Financial Chat</h4>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Ask me anything about your finances</p>
                </div>
                
                {/* Chat Messages */}
                <div style={{
                  height: '35vh',
                  overflowY: 'auto',
                  marginBottom: '15px',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '2px solid #e9ecef'
                }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '10px' }}>🤖</div>
                      <p style={{ margin: 0, fontSize: '14px' }}>Hi! Ask me about your budget, savings, or expenses.</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Try: "How can I save more money?"</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} style={{ marginBottom: '15px' }}>
                        {/* User Message */}
                        <div style={{
                          textAlign: 'right',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '15px 15px 5px 15px',
                            maxWidth: '80%',
                            fontSize: '13px'
                          }}>
                            {msg.question}
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div style={{
                          textAlign: 'left'
                        }}>
                          <div style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            color: '#2c3e50',
                            padding: '8px 12px',
                            borderRadius: '15px 15px 15px 5px',
                            maxWidth: '80%',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}>
                            🤖 {msg.answer}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Chat Input */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  padding: '0 10px 20px 10px',
                  marginTop: '10px'
                }}>
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="💬 Type your question here..."
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      border: '3px solid #34656D',
                      borderRadius: '25px',
                      fontSize: '15px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 15px rgba(52, 101, 109, 0.3), inset 0 1px 3px rgba(0,0,0,0.1)',
                      color: '#2c3e50',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4), inset 0 1px 3px rgba(0,0,0,0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#34656D';
                      e.target.style.boxShadow = '0 4px 15px rgba(52, 101, 109, 0.3), inset 0 1px 3px rgba(0,0,0,0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentQuestion.trim()) {
                        handleAIChat();
                      }
                    }}
                  />
                  <button
                    onClick={handleAIChat}
                    disabled={!currentQuestion.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '10px 15px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      opacity: currentQuestion.trim() ? 1 : 0.5
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat and Queries Modal */}
      {showChatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            maxWidth: '700px',
            width: '95%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ color: '#34656D', margin: 0 }}>Community Chat & Queries</h3>
              <button 
                onClick={() => setShowChatModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              marginBottom: '20px',
              fontSize: '13px',
              color: '#666'
            }}>
              Share your experience, suggestions, or queries about the Budget Tracker application.
            </div>

            {/* Command Input */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <textarea
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                placeholder="Share your thoughts, suggestions, or queries about the application..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleSubmitCommand}
                style={{
                  marginTop: '10px',
                  padding: '8px 20px',
                  backgroundColor: '#34656D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Post Command
              </button>
            </div>

            {/* Commands List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e9ecef',
              borderRadius: '8px'
            }}>
              {commands.map((command) => (
                <div key={command.id} style={{
                  padding: '15px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: 'white'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <strong style={{ color: '#34656D', fontSize: '14px' }}>{command.userId?.name || command.userId?.username || 'Anonymous'}</strong>
                      <span style={{ color: '#999', fontSize: '12px', marginLeft: '10px' }}>{new Date(command.created).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <p style={{
                    margin: '0 0 10px 0',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    color: '#333'
                  }}>
                    {command.content}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '10px'
                  }}>
                    <button
                      onClick={() => handleLike(command.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: likedPosts.has(command.id) ? '#007bff' : '#34656D',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <ThumbUpAltIcon style={{ fontSize: '16px' }} /> {postLikes[command.id] || 0}
                    </button>
                    <button
                      onClick={() => setShowReplyFor(showReplyFor === command.id ? null : command.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#34656D',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <ReplyIcon style={{ fontSize: '16px' }} /> Reply ({(postReplies[command.id] || []).length})
                    </button>
                  </div>

                  {/* Replies */}
                  {loadingReplies[command.id] ? (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>Loading replies...</div>
                  ) : (postReplies[command.id] || []).length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      paddingLeft: '20px',
                      borderLeft: '2px solid #e9ecef'
                    }}>
                      {(postReplies[command.id] || []).map((reply) => (
                        <div key={reply.id} style={{
                          padding: '8px 0',
                          borderBottom: '1px solid #f8f9fa',
                          fontSize: '13px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px'
                          }}>
                            <strong style={{ color: '#34656D' }}>{reply.userId?.name || 'Anonymous'}</strong>
                            <span style={{ color: '#999', fontSize: '11px' }}>
                              {new Date(reply.createdAs).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#555' }}>{reply.comments}</p>
                        </div>
                      ))}
                    </div>
                  )}


                  {/* Reply Input */}
                  {showReplyFor === command.id && (
                    <div style={{
                      marginTop: '10px',
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}
                      />
                      <button
                        onClick={() => handleReply(command.id)}
                        style={{
                          padding: '8px 15px',
                          backgroundColor: '#34656D',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
