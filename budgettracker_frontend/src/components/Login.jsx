import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import BeforeLoginNav from '../navigationBar/BeforeLoginNav'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      })

      // If response is successful
      if (response.status === 200) {
        const data = response.data
        login(data.token)
        navigate('/userDashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password')
      } else {
        setError('Login failed. Please check your internet connection or try again.')
      }
    }
  }

  const handleSignupRedirect = () => {
    navigate('/signup')
  }

  return (
    <>
      <BeforeLoginNav />
      <div className="login-container">
        <div className="login-form">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Please sign in to your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <div className="signup-link">
            <p>Don't have an account?
              <span onClick={handleSignupRedirect} className="signup-text">
                Sign up here
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
