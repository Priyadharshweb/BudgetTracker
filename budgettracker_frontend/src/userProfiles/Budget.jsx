import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AfterLogin from '../navigationBar/AfterLogin';
import { budgetAPI, transactionAPI } from '../services/api';
import './Budget.css';

const Budget = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [categoryTransactions, setCategoryTransactions] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    startDate: '',
    endDate: ''
  });

  const categories = [
    { name: 'Food', icon: '🍽️', color: '#FF6B6B' },
    { name: 'Travel', icon: '✈️', color: '#4ECDC4' },
    { name: 'Bill', icon: '📄', color: '#45B7D1' },
    { name: 'Home', icon: '🏠', color: '#96CEB4' },
    { name: 'Car', icon: '🚗', color: '#FFEAA7' },
    { name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#DDA0DD' },
    { name: 'Personal', icon: '👤', color: '#98D8C8' },
    { name: 'Other', icon: '📦', color: '#F7DC6F' }
  ];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    
    fetchBudgets();
    
    // Refresh budgets every 30 seconds to reflect transaction changes
    const interval = setInterval(fetchBudgets, 30000);
    
    // Listen for storage events (when transactions are added/updated)
    const handleStorageChange = (e) => {
      if (e.key === 'transactionUpdated') {
        console.log('Transaction updated, refreshing budgets...');
        setTimeout(fetchBudgets, 500); // Small delay to ensure transaction is saved
      }
    };
    
    // Listen for custom events from same window
    const handleTransactionUpdate = () => {
      console.log('Transaction update event received');
      setTimeout(fetchBudgets, 500);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('transactionUpdated', handleTransactionUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('transactionUpdated', handleTransactionUpdate);
    };
  }, [navigate]);

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getBudgets();
      const budgetsWithSpent = await Promise.all(
        response.data.map(async (budget) => {
          const spent = await calculateSpentAmount(budget.category, budget.startDate, budget.endDate);
          return { ...budget, spent };
        })
      );
      setBudgets(budgetsWithSpent.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const calculateSpentAmount = async (category, startDate, endDate) => {
    try {
      const response = await transactionAPI.getTransactions();
      console.log('All transactions:', response.data);
      console.log('Filtering for category:', category, 'between', startDate, 'and', endDate);
      
      const transactions = response.data.filter(t => {
        const categoryMatch = t.category && t.category.toLowerCase() === category.toLowerCase();
        const typeMatch = t.type && (t.type.toLowerCase() === 'expense' || t.type === 'EXPENSE');
        const dateMatch = t.date >= startDate && t.date <= endDate;
        
        console.log('Transaction:', t.category, t.type, t.date, 'Matches:', categoryMatch, typeMatch, dateMatch);
        return categoryMatch && typeMatch && dateMatch;
      });
      
      console.log('Filtered transactions:', transactions);
      const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      console.log('Total spent for', category, ':', total);
      return total;
    } catch (error) {
      console.error('Error calculating spent amount:', error);
      return 0;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      if (editingId) {
        await budgetAPI.updateBudget(editingId, budgetData);
      } else {
        await budgetAPI.createBudget(budgetData);
      }

      await fetchBudgets();
      setShowForm(false);
      setEditingId(null);
      setFormData({ category: '', amount: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Error saving budget. Please try again.');
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      startDate: budget.startDate,
      endDate: budget.endDate
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.deleteBudget(id);
        await fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Error deleting budget. Please try again.');
      }
    }
  };

  const getProgressPercentage = (spent, budget) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage === 0) return '#28a745'; // Green - not used
    if (percentage < 100) return '#ffc107'; // Yellow - partially used
    return '#dc3545'; // Red - reached/exceeded goal
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    return category ? category.icon : '📦';
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    return category ? category.color : '#34656D';
  };

  const handleBudgetClick = async (budget) => {
    setSelectedBudget(budget);
    try {
      const response = await transactionAPI.getTransactions();
      const filtered = response.data.filter(t => 
        t.category && t.category.toLowerCase() === budget.category.toLowerCase() &&
        t.date >= budget.startDate && 
        t.date <= budget.endDate
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
      setCategoryTransactions(filtered);
    } catch (error) {
      console.error('Error fetching category transactions:', error);
      setCategoryTransactions([]);
    }
  };

  return (
    <>
      <AfterLogin />
      <div style={{backgroundColor: '#f5f8fb', minHeight: '100vh', paddingTop: '80px'}}>
        <div className="budget-container" style={{padding: '20px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: selectedBudget ? '3fr 1fr' : '1fr', gap: '20px', alignItems: 'start'}}>
          
          <div>
          <div className="budget-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#34656D', fontSize: '28px', margin: 0}}>Budget Management</h1>
            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: '#34656D', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '12px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                <FaPlus /> Add Budget
              </button>
              <button 
                onClick={() => navigate('/savings')}
                style={{
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '12px 20px', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                 Savings Goal
              </button>
            </div>
          </div>

          <div className="filter" style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>By category:</label>
            <select 
              value={filterCategory}
              onChange={(e) => {
                console.log('Filter changed to:', e.target.value);
                setFilterCategory(e.target.value);
              }}
              style={{
                padding: '8px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              <option value="">All categories</option>
              <option value="food">Food</option>
              <option value="travel"> Travel</option>
              <option value="bill">Bill</option>
              <option value="home">Home</option>
              <option value="car"> Car</option>
              <option value="family">Family</option>
              <option value="personal"> Personal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="budget-list" style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px'}}>
            {budgets.filter(budget => 
              filterCategory === '' || budget.category.toLowerCase() === filterCategory
            ).map((budget) => {
              const progressPercentage = getProgressPercentage(budget.spent, budget.amount);
              const isOverBudget = budget.spent > budget.amount;
              
              return (
                <div 
                  key={budget.id} 
                  className="budget-row" 
                  onClick={() => handleBudgetClick(budget)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)',
                    border: selectedBudget?.id === budget.id ? `2px solid ${getCategoryColor(budget.category)}` : `2px solid ${getCategoryColor(budget.category)}20`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <span style={{fontSize: '32px'}}>{getCategoryIcon(budget.category)}</span>
                      <div>
                        <h3 style={{margin: 0, color: '#34656D', fontSize: '20px'}}>{budget.category}</h3>
                        <p style={{margin: 0, color: '#6c757d', fontSize: '14px'}}>{budget.startDate} - {budget.endDate}</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                      <div style={{textAlign: 'right'}}>
                        <div style={{fontSize: '14px', color: '#6c757d', marginBottom: '4px'}}>Spent: ₹{budget.spent.toFixed(2)}</div>
                        <div style={{fontSize: '14px', color: '#6c757d'}}>Budget: ₹{budget.amount.toFixed(2)}</div>
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => handleEdit(budget)} style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '18px', padding: '5px'}}>
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(budget.id)} style={{background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '18px', padding: '5px'}}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{marginBottom: '15px'}}>

                    <div style={{
                      width: '100%',
                      height: '12px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progressPercentage}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(budget.spent, budget.amount),
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: isOverBudget ? '#dc3545' : '#28a745'
                      }}>
                        ₹{(budget.amount - budget.spent).toFixed(2)} {isOverBudget ? 'over budget' : 'remaining'}
                      </span>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBudgetClick(budget);
                          }}
                          style={{
                            backgroundColor: '#34656D',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          View History
                        </button>
                        <span style={{fontSize: '14px', color: '#6c757d'}}>
                          {progressPercentage.toFixed(1)}% used
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {budgets.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'
            }}>
              <h3 style={{color: '#6c757d', marginBottom: '10px'}}>No budgets created yet</h3>
              <p style={{color: '#6c757d', marginBottom: '20px'}}>Start by creating your first budget for a category</p>
              <button 
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: '#34656D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Create First Budget
              </button>
            </div>
          )}

          {showForm && (
            <div className="modal-overlay" style={{
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
              <div className="budget-form" style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90%'
              }}>
                <h2 style={{marginBottom: '20px', textAlign: 'center', color: '#34656D'}}>
                  {editingId ? 'Edit Budget' : 'Create Budget'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Category:</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      required 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name.toLowerCase()}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Budget Amount:</label>
                    <input 
                      type="number" 
                      name="amount" 
                      value={formData.amount} 
                      onChange={handleInputChange} 
                      required 
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Start Date:</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleInputChange} 
                      required 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{marginBottom: '25px'}}>
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>End Date:</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleInputChange} 
                      required 
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                      type="submit" 
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#34656D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaSave /> {editingId ? 'Update' : 'Create'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({ category: '', amount: '', startDate: '', endDate: '' });
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>

          {selectedBudget && (
            <div style={{marginTop: '88px', marginLeft: '40px'}}>
              <div style={{
                backgroundColor: 'rgb(52, 101, 109)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)',
                height: '60vh',
                width:'50vh',
                overflow: 'hidden'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                  <h3 style={{margin: 0, color: 'white', fontSize: '18px'}}>
                    {getCategoryIcon(selectedBudget.category)} {selectedBudget.category} Transactions
                  </h3>
                  <button 
                    onClick={() => setSelectedBudget(null)}
                    style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px'}}
                  >
                    ×
                  </button>
                </div>
                <div style={{height: 'calc(70vh - 80px)', overflowY: 'auto'}}>
                  {categoryTransactions.length > 0 ? (
                    categoryTransactions.map((transaction) => (
                      <div key={transaction.id} style={{
                        padding: '10px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{fontSize: '14px', fontWeight: '500', color: 'white'}}>
                            {transaction.description || 'No description'}
                          </div>
                          <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.7)'}}>
                            {transaction.date}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: transaction.type === 'income' ? '#28a745' : '#dc3545'
                        }}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{textAlign: 'center', padding: '20px', color: 'white'}}>
                      No transactions found for this category
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Budget;