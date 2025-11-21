import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaPiggyBank } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AfterLogin from '../navigationBar/AfterLogin';
import { savingsAPI } from '../services/api';

const Savings = () => {
  const navigate = useNavigate();
  const [savings, setSavings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    goal_name: '',
    target_amt: '',
    curr_amt: '',
    deadline: ''
  });



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    
    fetchSavings();
  }, [navigate]);

  const fetchSavings = async () => {
    try {
      const response = await savingsAPI.getSavings();
      setSavings(response.data || []);
    } catch (error) {
      console.error('Error fetching savings:', error);
      setSavings([]);
    }
  };





  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savingData = {
        goal_name: formData.goal_name,
        target_amt: parseFloat(formData.target_amt),
        curr_amt: parseFloat(formData.curr_amt) || 0,
        deadline: formData.deadline
      };

      if (editingId) {
        await savingsAPI.updateSaving(editingId, savingData);
      } else {
        await savingsAPI.createSaving(savingData);
      }

      await fetchSavings();
      setShowForm(false);
      setEditingId(null);
      setFormData({ goal_name: '', target_amt: '', curr_amt: '', deadline: '' });
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving savings goal. Please try again.');
    }
  };

  const handleEdit = (saving) => {
    setFormData({
      goal_name: saving.goal_name,
      target_amt: saving.target_amt.toString(),
      curr_amt: saving.curr_amt.toString(),
      deadline: saving.deadline
    });
    setEditingId(saving.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await savingsAPI.deleteSaving(id);
        await fetchSavings();
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting savings goal. Please try again.');
      }
    }
  };

  const addToSavings = async (savingId, amount) => {
    try {
      const saving = savings.find(s => s.id === savingId);
      const updatedData = {
        goal_name: saving.goal_name,
        target_amt: saving.target_amt,
        curr_amt: saving.curr_amt + parseFloat(amount),
        deadline: saving.deadline
      };
      await savingsAPI.updateSaving(savingId, updatedData);
      await fetchSavings();
    } catch (error) {
      console.error('Error adding to savings:', error);
      alert('Error updating savings amount. Please try again.');
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };



  const getTotalSavings = () => {
    return savings.reduce((total, saving) => total + saving.curr_amt, 0);
  };

  const getCompletedGoals = () => {
    return savings.filter(s => s.curr_amt >= s.target_amt).length;
  };

  return (
    <>
      <AfterLogin />
      <div style={{backgroundColor: '#f5f8fb', minHeight: '100vh', paddingTop: '80px'}}>
        <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#34656D', fontSize: '28px', margin: 0}}>Savings Goals</h1>
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
              <FaPlus /> Add Savings Goal
            </button>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)', textAlign: 'center'}}>
              <FaPiggyBank style={{fontSize: '32px', color: '#34656D', marginBottom: '10px'}} />
              <h3 style={{margin: 0, color: '#34656D'}}>Total Savings</h3>
              <p style={{fontSize: '24px', fontWeight: 'bold', color: '#28a745', margin: '5px 0'}}>₹{getTotalSavings().toFixed(2)}</p>
            </div>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)', textAlign: 'center'}}>
              <div style={{fontSize: '32px', marginBottom: '10px'}}>🎯</div>
              <h3 style={{margin: 0, color: '#34656D'}}>Active Goals</h3>
              <p style={{fontSize: '24px', fontWeight: 'bold', color: '#34656D', margin: '5px 0'}}>{savings.length}</p>
            </div>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)', textAlign: 'center'}}>
              <div style={{fontSize: '32px', marginBottom: '10px'}}>✅</div>
              <h3 style={{margin: 0, color: '#34656D'}}>Completed</h3>
              <p style={{fontSize: '24px', fontWeight: 'bold', color: '#28a745', margin: '5px 0'}}>{getCompletedGoals()}</p>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
            {savings.map((saving) => {
              const progressPercentage = getProgressPercentage(saving.curr_amt, saving.target_amt);
              const isCompleted = saving.curr_amt >= saving.target_amt;
              
              return (
                <div 
                  key={saving.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)',
                    border: isCompleted ? '2px solid #28a745' : '2px solid transparent'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{fontSize: '24px'}}>💰</span>
                      <div>
                        <h3 style={{margin: 0, color: '#34656D'}}>{saving.goal_name}</h3>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button onClick={() => handleEdit(saving)} style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '16px'}}>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(saving.id)} style={{background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px'}}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div style={{marginBottom: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <span style={{fontSize: '14px', color: '#6c757d'}}>Progress</span>
                      <span style={{fontSize: '14px', fontWeight: 'bold', color: isCompleted ? '#28a745' : '#34656D'}}>
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progressPercentage}%`,
                        height: '100%',
                        backgroundColor: isCompleted ? '#28a745' : '#34656D',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <div>
                      <div style={{fontSize: '12px', color: '#6c757d'}}>Current</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold', color: '#28a745'}}>₹{saving.curr_amt.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#6c757d'}}>Target</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold', color: '#34656D'}}>₹{saving.target_amt.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#6c757d'}}>Remaining</div>
                      <div style={{fontSize: '18px', fontWeight: 'bold', color: isCompleted ? '#28a745' : '#dc3545'}}>
                        ₹{Math.max(0, saving.target_amt - saving.curr_amt).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{fontSize: '12px', color: '#6c757d', marginBottom: '10px'}}>
                    Deadline: {new Date(saving.deadline).toLocaleDateString()}
                  </div>

                  {!isCompleted && (
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input 
                        type="number" 
                        placeholder="Add amount"
                        style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            addToSavings(saving.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            addToSavings(saving.id, input.value);
                            input.value = '';
                          }
                        }}
                        style={{
                          backgroundColor: '#34656D',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div style={{
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      padding: '10px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      🎉 Goal Completed!
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {savings.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(52, 101, 109, 0.1)'
            }}>
              <FaPiggyBank style={{fontSize: '64px', color: '#6c757d', marginBottom: '20px'}} />
              <h3 style={{color: '#6c757d', marginBottom: '10px'}}>No savings goals yet</h3>
              <p style={{color: '#6c757d', marginBottom: '20px'}}>Start saving for your future by creating your first savings goal</p>
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
                Create First Goal
              </button>
            </div>
          )}

          {showForm && (
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
                padding: '30px',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90%'
              }}>
                <h2 style={{marginBottom: '20px', textAlign: 'center', color: '#34656D'}}>
                  {editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Goal Name:</label>
                    <input 
                      type="text" 
                      name="goal_name" 
                      value={formData.goal_name} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Enter goal name"
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
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Target Amount:</label>
                    <input 
                      type="number" 
                      name="target_amt" 
                      value={formData.target_amt} 
                      onChange={handleInputChange} 
                      required 
                      min="0"
                      step="0.01"
                      placeholder="Enter target amount"
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
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Current Amount:</label>
                    <input 
                      type="number" 
                      name="curr_amt" 
                      value={formData.curr_amt} 
                      onChange={handleInputChange} 
                      min="0"
                      step="0.01"
                      placeholder="Enter current amount (optional)"
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
                    <label style={{display: 'block', marginBottom: '8px', color: '#34656D', fontWeight: '500'}}>Deadline:</label>
                    <input 
                      type="date" 
                      name="deadline" 
                      value={formData.deadline} 
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
                        setFormData({ goal_name: '', target_amt: '', curr_amt: '', deadline: '' });
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
      </div>
    </>
  );
};

export default Savings;