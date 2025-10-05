import React, { useState } from 'react'
import './AboutUs.css'
import BeforeLoginNav from '../navigationBar/BeforeLoginNav'
import AfterLogin from '../navigationBar/AfterLogin'
import { useAuth } from '../context/AuthContext'

const AboutUs = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    query: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', query: '' })
  }

  return (
    <>
      {isAuthenticated ? <AfterLogin /> : <BeforeLoginNav />}
      <div className="about-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>About Budget Tracker</h1>
            <p>Take control of your finances with our intuitive budget tracking application. 
               Monitor expenses, set financial goals, and make informed decisions about your money.</p>
            <p>Our platform helps you visualize spending patterns, categorize expenses, 
               and stay on track with your financial objectives.</p>
          </div>
        </div>
        
        <div className="contact-section">
          <div className="contact-form-container">
            <h2>Contact Us</h2>
            <p>Have questions or feedback? We'd love to hear from you!</p>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <textarea
                  name="query"
                  placeholder="Your Message or Query"
                  value={formData.query}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AboutUs
