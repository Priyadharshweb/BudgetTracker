import React, { useState, useEffect } from 'react';
import AfterLogin from '../navigationBar/AfterLogin';
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

      // If any admin endpoint returns 403, user is not admin
      if (usersRes.status === 403 || transactionsRes.status === 403 || budgetsRes.status === 403 || savingsRes.status === 403) {
        navigate('/user-dashboard', { replace: true });
        return;
      }

      if (usersRes.ok) setUsers(await usersRes.json());
      if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      if (budgetsRes.ok) setBudgets(await budgetsRes.json());
      if (savingsRes.ok) setSavings(await savingsRes.json());
    } catch (error) {
      console.error('Error fetching admin data:', error);
      navigate('/user-dashboard', { replace: true });
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
    const categoryTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const category = t.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(t.amount);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  const getUserRegistrationData = () => {
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
        <AfterLogin />
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <AfterLogin />
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
                <h3>Monthly Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#28a745" name="Income" />
                    <Bar dataKey="expenses" fill="#dc3545" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Expense Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={getCategoryData()} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={70} 
                      dataKey="value"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>User Registration Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getUserRegistrationData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Budget vs Savings Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={getBudgetSavingsData()} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={40}
                      outerRadius={80} 
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getBudgetSavingsData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
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