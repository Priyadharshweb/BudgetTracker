import React from 'react'
import { useNavigate } from 'react-router-dom'
import './BeforeLoginNav.css'

const BeforeLoginNav = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/signup')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="app-name">BudgetTracker</div>
        <ul className="nav-links">
          <li>Home</li>
          <li>Features</li>
          <li>About Us</li>
        </ul>
      </div>
      <div className="nav-right">
        <button className="login-btn" onClick={handleLogin}>Login</button>
        <button className="signup-btn" onClick={handleSignup}>Signup</button>
      </div>
    </nav>
  )
}

export default BeforeLoginNav
