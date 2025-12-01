import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import BeforeLoginNav from '../navigationBar/BeforeLoginNav'
import { authAPI } from '../services/api'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter'
    if (!hasNumber) return 'Password must contain at least one number'
    if (!hasSpecialChar) return 'Password must contain at least one special character'
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear password error when typing
    if (name === 'password') {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validate password before submitting
    const passwordValidationError = validatePassword(formData.password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }
    
    try {
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase()
      })

      setSuccess('User registered successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Signup failed. Please check your internet connection or try again.')
    }
  }

  const handleLoginRedirect = () => {
    navigate('/login')
  }

  return (
    <>
      <BeforeLoginNav />
      <div className="signup-container">
        <div className="signup-form">
          <h2>Sign Up</h2>
          {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </span>
              </div>
              {passwordError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{passwordError}</div>}
            </div>
            <div className="input-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="signup-btn">
              Sign Up
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account?
              <span onClick={handleLoginRedirect} className="login-text">
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup
