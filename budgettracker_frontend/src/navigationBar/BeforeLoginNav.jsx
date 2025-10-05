import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './BeforeLoginNav.css'

const BeforeLoginNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/signup')
  }
  const handleHome=()=>{
    navigate('/')
  }
  const handleFeatures=()=>{
    navigate('/features')
  }
  const handleAbout=()=>{
    navigate('/aboutUs')
  }
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="app-name">BudgetTracker</div>
        <ul className="nav-links">
          <li onClick={handleHome} className={location.pathname === '/' ? 'active' : ''}>Home</li>
          <li onClick={handleFeatures} className={location.pathname === '/features' ? 'active' : ''}>Features</li>
          <li onClick={handleAbout} className={location.pathname === '/aboutUs' ? 'active' : ''}>About Us</li>
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
