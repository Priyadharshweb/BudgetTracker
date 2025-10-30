import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transaction.css';
import { FaPlusCircle, FaRegClock, FaEdit, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import AfterLogin from '../navigationBar/AfterLogin';
import Footer from '../components/Footer';
import { transactionAPI, authAPI } from '../services/api';

const TransactionDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [noteFilter, setNoteFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    category: '',
    description: '',
    date: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchTransactions();
    fetchUserName();
  }, [navigate]);

  const fetchUserName = async () => {
    try {
      const response = await authAPI.getProfile();
      setUserName(response.data.name || 'User');
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User');
    }
  };

  useEffect(() => {
    applyFilters();
  }, [categoryFilter, noteFilter, typeFilter, transactions]);

  const fetchTransactions = () => {
    transactionAPI.getTransactions()
      .then(response => {
        const sortedTransactions = (response.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(sortedTransactions);
        setFilteredTransactions(sortedTransactions);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error.message);
        setTransactions([]);
      });
  };

  const getUsedCategories = () => {
    const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
    return categories.sort();
  };

  const applyFilters = () => {
    let filtered = transactions;
    
    if (categoryFilter) {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    if (noteFilter) {
      filtered = filtered.filter(t => 
        (t.description && t.description.toLowerCase().includes(noteFilter.toLowerCase()))
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleNoteFilter = (note) => {
    setNoteFilter(note);
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
  };

  const calculateSummary = () => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const walletBalance = totalIncome - totalExpenses;
    const periodChange = walletBalance;
    
    return { totalIncome, totalExpenses, walletBalance, periodChange };
  };

  const { totalIncome, totalExpenses, walletBalance, periodChange } = calculateSummary();

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date
    };
    
    const apiCall = editingId 
      ? transactionAPI.updateTransaction(editingId, transactionData)
      : transactionAPI.createTransaction(transactionData);
    
    apiCall
      .then(() => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ type: '', amount: '', category: '', description: '', date: '' });
        fetchTransactions();
        setCategoryFilter('');
        setNoteFilter('');
        setTypeFilter('');
        // Trigger budget update
        localStorage.setItem('transactionUpdated', Date.now().toString());
        localStorage.removeItem('transactionUpdated');
        // Dispatch custom event for same window
        window.dispatchEvent(new CustomEvent('transactionUpdated'));
      })
      .catch(error => {
        console.error('Error saving transaction:', error.message);
        alert('Error saving transaction. Please try again.');
      });
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      transactionAPI.deleteTransaction(id)
        .then(() => {
          fetchTransactions();
          setCategoryFilter('');
          setNoteFilter('');
          setTypeFilter('');
          // Trigger budget update
          localStorage.setItem('transactionUpdated', Date.now().toString());
          localStorage.removeItem('transactionUpdated');
          // Dispatch custom event for same window
          window.dispatchEvent(new CustomEvent('transactionUpdated'));
        })
        .catch(error => {
          console.error('Error deleting transaction:', error.message);
          alert('Error deleting transaction. Please try again.');
        });
    }
  };

  return (
    <>
    <AfterLogin/>
    <div style={{backgroundColor: '#f5f8fb', minHeight: '100vh', paddingTop: '80px'}}>
    <div className="transaction-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px'}}>
      <button className="add-transaction-btn" style={{backgroundColor: '#34656D', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.3)', transition: 'all 0.3s ease'}} onClick={() => setShowForm(true)} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
        <FaPlusCircle className="icon" /> Add transaction
      </button>
      
      <div className="filters-section" style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
        <div className="filter">
          <label>By category</label>
          <select value={categoryFilter} onChange={(e) => handleCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {getUsedCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>By people</label>
          <div className="people-chip">{userName}</div>
        </div>
        <div className="filter">
          <label>By note</label>
          <input 
            type="text" 
            placeholder="Filter by specific keyword" 
            value={noteFilter}
            onChange={(e) => handleNoteFilter(e.target.value)}
          />
        </div>
        <div className="filter">
          <label>By type</label>
          <select value={typeFilter} onChange={(e) => handleTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <button className="reset-filters">Reset filters</button>
      </div>
      
      <div className="date-selector">
        <button className="date-nav">‹</button>
        <div className="date-dropdown-container">
          <button className="date-range">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="calendar-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path>
            </svg>
            Oct 01, 2025 – Oct 31, 2025
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="dropdown-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
            </svg>
          </button>
        </div>
        <button className="date-nav">›</button>
      </div>
    </div>
    <div className="dashboard-container">

      <div className="summary-cards">
        <div className="summary-card" style={{background: 'linear-gradient(135deg, #34656D 0%, #6c757d 100%)', color: 'white', boxShadow: '0 8px 25px rgba(52, 101, 109, 0.2)', border: 'none'}}>
          <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px'}}>Current Wallet Balance</p>
          <h3 style={{color: 'white', fontSize: '24px', fontWeight: '600', margin: '0'}}>{walletBalance >= 0 ? '+' : ''}{walletBalance.toFixed(2)} USD</h3>
        </div>
        <div className="summary-card" style={{background: 'linear-gradient(135deg, #34656D 0%, #8d9499 100%)', color: 'white', boxShadow: '0 8px 25px rgba(52, 101, 109, 0.2)', border: 'none'}}>
          <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px'}}>Total Period Change</p>
          <h3 style={{color: 'white', fontSize: '24px', fontWeight: '600', margin: '0'}}>{periodChange >= 0 ? '+' : ''}{periodChange.toFixed(2)} USD</h3>
        </div>
        <div className="summary-card" style={{background: 'linear-gradient(135deg, #34656D 0%, #adb5bd 100%)', color: 'white', boxShadow: '0 8px 25px rgba(52, 101, 109, 0.2)', border: 'none'}}>
          <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px'}}>Total Period Expenses</p>
          <h3 style={{color: 'white', fontSize: '24px', fontWeight: '600', margin: '0'}}>{totalExpenses.toFixed(2)} USD</h3>
        </div>
        <div className="summary-card" style={{background: 'linear-gradient(135deg, #34656D 0%, #495057 100%)', color: 'white', boxShadow: '0 8px 25px rgba(52, 101, 109, 0.2)', border: 'none'}}>
          <p style={{color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px'}}>Total Period Income</p>
          <h3 style={{color: 'white', fontSize: '24px', fontWeight: '600', margin: '0'}}>+{totalIncome.toFixed(2)} USD</h3>
        </div>
      </div>

      <div className="transaction-list">
        {currentTransactions.length > 0 ? (
          currentTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item" style={{display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee'}}>
              <div style={{marginRight: '10px', fontSize: '16px'}}>
                {transaction.type === 'income' ? 
                  <FaArrowUp style={{color: '#28a745'}} /> : 
                  <FaArrowDown style={{color: '#dc3545'}} />
                }
              </div>
              <div className="transaction-icon" style={{marginRight: '10px'}}>
                <FaRegClock />
              </div>
              <div className="transaction-details" style={{flex: 1}}>
                <p className="transaction-title">{transaction.description || transaction.category}</p>
                <small>{transaction.date} • <span style={{backgroundColor: '#C27E3B', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px'}}>{transaction.category}</span></small>
              </div>
              <div className="transaction-amount" style={{marginRight: '10px', color: transaction.type === 'income' ? 'green' : 'red'}}>
                {transaction.type === 'income' ? '+' : '-'}{transaction.amount} USD
              </div>
              <div className="transaction-actions" style={{display: 'flex', gap: '5px'}}>
                <button onClick={() => handleEdit(transaction)} style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer'}}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(transaction.id)} style={{background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer'}}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#6c757d'}}>
            <p>No results found</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredTransactions.length > itemsPerPage && (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '20px'}}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                color: currentPage === 1 ? '#6c757d' : '#34656D',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: currentPage === page ? '#34656D' : 'white',
                  color: currentPage === page ? 'white' : '#34656D',
                  cursor: 'pointer',
                  fontWeight: currentPage === page ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: currentPage === totalPages ? '#f8f9fa' : 'white',
                color: currentPage === totalPages ? '#6c757d' : '#34656D',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
            
            <span style={{marginLeft: '15px', color: '#6c757d', fontSize: '14px'}}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </span>
          </div>
        )}
      </div>
    </div>

    {showForm && (
      <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
        <div className="transaction-form" style={{backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%'}}>
          <h2 style={{marginBottom: '20px', textAlign: 'center'}}>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '15px'}}>
              <label>Type:</label>
              <select name="type" value={formData.type} onChange={handleInputChange} required style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px'}}>
                <option value="">Select Type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div style={{marginBottom: '15px'}}>
              <label>Amount:</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px'}} />
            </div>
            <div style={{marginBottom: '15px'}}>
              <label>Category:</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px'}}>
                <option value="">Select Category</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="bill">Bill</option>
                <option value="home">Home</option>
                <option value="car">Car</option>
                <option value="family">Family</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{marginBottom: '15px'}}>
              <label>Description:</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px'}} />
            </div>
            <div style={{marginBottom: '20px'}}>
              <label>Date:</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px'}} />
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" style={{flex: 1, padding: '12px', backgroundColor: '#34656D', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.3)', transition: 'all 0.3s ease'}}>{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null); setFormData({ type: '', amount: '', category: '', description: '', date: '' });}} style={{flex: 1, padding: '12px', backgroundColor: '#ccc', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
    
    </>
  );
};

export default TransactionDashboard;