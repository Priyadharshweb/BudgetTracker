import React, { useState, useEffect } from 'react';
import AdminNav from './AdminNav';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './adminDashboard.css';

const AdminDashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !auth?.isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    // Check if user is admin
    if (auth?.user?.role !== 'ADMIN') {
      navigate('/user-dashboard', { replace: true });
      return;
    }
    fetchAdminData();
  }, [auth, navigate]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, transactionsRes, budgetsRes, savingsRes] = await Promise.all([
        fetch('http://localhost:8080/api/admin/users', { headers }),
        fetch('http://localhost:8080/api/admin/transactions', { headers }),
        fetch('http://localhost:8080/api/admin/budgets', { headers }),
        fetch('http://localhost:8080/api/admin/savings', { headers })
      ]);

      // Handle admin endpoints - continue even if some fail
      if (usersRes.status === 403 || transactionsRes.status === 403 || budgetsRes.status === 403 || savingsRes.status === 403) {
        console.warn('Some admin endpoints returned 403 - continuing with available data');
      }

      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else {
        console.warn('Users endpoint failed:', usersRes.status);
        setUsers([]);
      }
      
      if (transactionsRes.ok) {
        setTransactions(await transactionsRes.json());
      } else {
        console.warn('Transactions endpoint failed:', transactionsRes.status);
        setTransactions([]);
      }
      
      if (budgetsRes.ok) {
        setBudgets(await budgetsRes.json());
      } else {
        console.warn('Budgets endpoint failed:', budgetsRes.status);
        setBudgets([]);
      }
      
      if (savingsRes.ok) {
        setSavings(await savingsRes.json());
      } else {
        console.warn('Savings endpoint failed:', savingsRes.status);
        setSavings([]);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const getActiveUsers = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const activeCount = users.filter(user => 
      transactions.some(t => {
        const transactionDate = new Date(t.date);
        return t.userId === user.id && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
    ).length;
    return Math.max(activeCount, 1);
  };

  const getTotalTransactionAmount = () => {
    return transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  const getTotalBudgetAmount = () => {
    return budgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  };

  const getTotalSavingsAmount = () => {
    return savings.reduce((sum, s) => sum + parseFloat(s.curr_amt || 0), 0);
  };

  const getChartData = () => {
    if (transactions.length === 0) {
      // Sample data for demonstration
      return [
        { month: 'Jan', income: 45000, expenses: 32000 },
        { month: 'Feb', income: 52000, expenses: 38000 },
        { month: 'Mar', income: 48000, expenses: 35000 },
        { month: 'Apr', income: 61000, expenses: 42000 },
        { month: 'May', income: 55000, expenses: 39000 },
        { month: 'Jun', income: 67000, expenses: 45000 }
      ];
    }
    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expenses: 0 };
      if (t.type === 'income') monthlyData[month].income += parseFloat(t.amount);
      else monthlyData[month].expenses += parseFloat(t.amount);
    });
    return Object.values(monthlyData);
  };

  const getCategoryData = () => {
    if (transactions.length === 0) {
      // Sample expense categories data
      return [
        { name: 'Food', value: 15000 },
        { name: 'Travel', value: 12000 },
        { name: 'Bills', value: 8000 },
        { name: 'Shopping', value: 6000 },
        { name: 'Entertainment', value: 4000 },
        { name: 'Other', value: 3000 }
      ];
    }
    const categoryTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const category = t.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(t.amount);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  const getUserRegistrationData = () => {
    if (users.length === 0) {
      // Sample user registration data
      return [
        { month: 'Jan 24', users: 25 },
        { month: 'Feb 24', users: 32 },
        { month: 'Mar 24', users: 28 },
        { month: 'Apr 24', users: 45 },
        { month: 'May 24', users: 38 },
        { month: 'Jun 24', users: 52 }
      ];
    }
    const registrationData = {};
    users.forEach(user => {
      const month = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      registrationData[month] = (registrationData[month] || 0) + 1;
    });
    return Object.entries(registrationData).map(([month, users]) => ({ month, users }));
  };

  const getBudgetSavingsData = () => {
    const totalBudgets = getTotalBudgetAmount();
    const totalSavings = getTotalSavingsAmount();
    
    if (totalBudgets === 0 && totalSavings === 0) {
      // Sample budget vs savings data
      return [
        { name: 'Budgets', value: 85000, color: '#FF6B6B' },
        { name: 'Savings', value: 65000, color: '#4ECDC4' }
      ];
    }
    
    return [
      { name: 'Budgets', value: totalBudgets, color: '#FF6B6B' },
      { name: 'Savings', value: totalSavings, color: '#4ECDC4' }
    ];
  };

  const deleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTransactions(transactions.filter(t => t.id !== transactionId));
        alert('Transaction deleted successfully');
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };



  useEffect(() => {
    const handleNavTabChange = (event) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('adminTabChange', handleNavTabChange);
    return () => window.removeEventListener('adminTabChange', handleNavTabChange);
  }, []);

  // Listen for navigation changes from AfterLogin
  useEffect(() => {
    const handleAdminNavigation = (event) => {
      if (event.detail && window.location.pathname === '/admin-dashboard') {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('setAdminTab', handleAdminNavigation);
    return () => window.removeEventListener('setAdminTab', handleAdminNavigation);
  }, []);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  if (loading) {
    return (
      <>
        <AdminNav />
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users and monitor application analytics</p>
        </div>



        {activeTab === 'dashboard' && (
          <>
            <div className="analytics-cards">
              <div className="analytics-card">
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <h3>Total Users</h3>
                  <div className="card-number">{users.length}</div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">🟢</div>
                <div className="card-content">
                  <h3>Active Users</h3>
                  <div className="card-number">{getActiveUsers()}</div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Total Transactions</h3>
                  <div className="card-number">₹{getTotalTransactionAmount().toFixed(2)}</div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3>Total Budgets</h3>
                  <div className="card-number">₹{getTotalBudgetAmount().toFixed(2)}</div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <h3>Total Savings</h3>
                  <div className="card-number">₹{getTotalSavingsAmount().toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-container">
                <h3>📊 Monthly Income vs Expenses Trend</h3>
                <p style={{fontSize: '12px', color: '#666', margin: '5px 0 15px 0'}}>Track monthly financial performance across all users</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                      formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                      labelStyle={{color: '#333'}}
                      contentStyle={{backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#28a745" name="Income" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="expenses" fill="#dc3545" name="Expenses" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>🎯 Expense Categories Distribution</h3>
                <p style={{fontSize: '12px', color: '#666', margin: '5px 0 15px 0'}}>Breakdown of spending across different categories</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={getCategoryData()} 
                      cx="50%" 
                      cy="45%" 
                      outerRadius={70} 
                      dataKey="value"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      iconType="circle"
                      wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>📈 User Registration Growth</h3>
                <p style={{fontSize: '12px', color: '#666', margin: '5px 0 15px 0'}}>Monthly new user registrations over time</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getUserRegistrationData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                      formatter={(value) => [`${value} users`, 'New Registrations']}
                      labelStyle={{color: '#333'}}
                      contentStyle={{backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorUsers)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>💰 Budget vs Savings Overview</h3>
                <p style={{fontSize: '12px', color: '#666', margin: '5px 0 15px 0'}}>Total allocated budgets compared to savings goals</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={getBudgetSavingsData()} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={40}
                      outerRadius={75} 
                      dataKey="value"
                    >
                      {getBudgetSavingsData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px'}}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={50}
                      iconType="circle"
                      wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="admin-section">
            <h2>All Transactions</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{users.find(u => u.id === transaction.userId)?.name || transaction.userId}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.category}</td>
                      <td>₹{transaction.amount}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description || transaction.note}</td>
                      <td>
                        <button 
                          onClick={() => deleteTransaction(transaction.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;