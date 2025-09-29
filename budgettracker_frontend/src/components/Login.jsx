import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import BeforeLoginNav from '../navigationBar/BeforeLoginNav'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        navigate('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please check your internet connection or try again.')
    }
  }

  const handleSignupRedirect = () => {
    navigate('/signup')
  }

  return (
    <>
    <BeforeLoginNav/>
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
