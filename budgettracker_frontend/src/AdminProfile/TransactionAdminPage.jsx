import React, { useState, useEffect } from 'react';
import AfterLogin from '../navigationBar/AfterLogin';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './adminDashboard.css';

const TransactionAdminPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !auth?.isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    fetchData();
  }, [auth, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, transactionsRes] = await Promise.all([
        fetch('http://localhost:8080/api/admin/users', { headers }),
        fetch('http://localhost:8080/api/admin/transactions', { headers })
      ]);

      if (usersRes.status === 403 || transactionsRes.status === 403) {
        navigate('/user-dashboard', { replace: true });
        return;
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users data:', usersData);
        setUsers(usersData);
      }
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        console.log('Transactions data:', transactionsData);
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/user-dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (!selectedUserId) return transactions;
    
    console.log('Selected User ID:', selectedUserId);
    console.log('Sample transaction:', transactions[0]);
    
    const filtered = transactions.filter(t => {
      // Check multiple possible field names for user ID
      const userIdField = t.userId || t.user_id || t.user?.id || t.createdBy?.id;
      const match = userIdField === parseInt(selectedUserId) || userIdField === selectedUserId;
      console.log(`Transaction ${t.id}: userIdField=${userIdField}, selectedUserId=${selectedUserId}, match=${match}`);
      return match;
    });
    
    console.log('Filtered transactions:', filtered);
    return filtered;
  };

  const getPaginatedTransactions = () => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredTransactions().length / itemsPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUserFilterChange = (userId) => {
    setSelectedUserId(userId);
    setCurrentPage(1);
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

  if (loading) {
    return (
      <>
        <AfterLogin />
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Loading Transactions...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <AfterLogin />
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Transaction Management</h1>
          <p>View and manage all user transactions</p>
        </div>

        <div className="filter-section">
          <label>Sort by User:</label>
          <select 
            value={selectedUserId} 
            onChange={(e) => handleUserFilterChange(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="admin-section">
          <h2>
            Transaction History 
            {selectedUserId && ` - ${users.find(u => u.id === parseInt(selectedUserId))?.name}`}
          </h2>
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
                {getPaginatedTransactions().map(transaction => (
                  <tr key={transaction.id}>
                    <td>{users.find(u => u.id === (transaction.userId || transaction.user_id || transaction.user?.id))?.name || 'Unknown User'}</td>
                    <td>
                      <span style={{
                        color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {transaction.type === 'income' ? '↗️' : '↙️'} {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.category}</td>
                    <td>₹{transaction.amount}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description || transaction.note || '-'}</td>
                    <td>
                      <button 
                        onClick={() => deleteTransaction(transaction.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
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
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#666' }}>
              Showing {getPaginatedTransactions().length} of {getFilteredTransactions().length} transactions
            </div>
            
            {getTotalPages() > 1 && (
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #34656D',
                    backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                    color: currentPage === 1 ? '#6c757d' : '#34656D',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #34656D',
                      backgroundColor: currentPage === page ? '#34656D' : 'white',
                      color: currentPage === page ? 'white' : '#34656D',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      minWidth: '40px'
                    }}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === getTotalPages()}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #34656D',
                    backgroundColor: currentPage === getTotalPages() ? '#f8f9fa' : 'white',
                    color: currentPage === getTotalPages() ? '#6c757d' : '#34656D',
                    borderRadius: '4px',
                    cursor: currentPage === getTotalPages() ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionAdminPage;