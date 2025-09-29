import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
import BeforeLoginNav from '../navigationBar/BeforeLoginNav'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role.toUpperCase()
        }),
      })

      if (response.ok) {
        setSuccess('User registered successfully!')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        const errorText = await response.text()
        setError(errorText)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Signup failed. Please check your internet connection or try again.')
    }
  }

  const handleLoginRedirect = () => {
    navigate('/login')
  }

  return (
    <>
    <BeforeLoginNav/>
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
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
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
