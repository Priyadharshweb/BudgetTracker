import React, { useState, useEffect, useRef } from 'react'
import AfterLogin from '../navigationBar/AfterLogin'
import './EditProfile.css'

const Editprofile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    birthDate: { day: '', month: '', year: '' },
    currency: 'USD',
    language: 'english'
  })
  const [profileImage, setProfileImage] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const userData = await response.json()
        setFormData({
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
          email: userData.email || '',
          gender: userData.gender || '',
          birthDate: userData.birthDate || { day: '', month: '', year: '' },
          currency: userData.currency || 'USD',
          language: userData.language || 'english'
        })
        setProfileImage(userData.profileImage || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          gender: formData.gender,
          currency: formData.currency,
          language: formData.language
        })
      })
      if (response.ok) {
        alert('Profile updated successfully!')
        // Trigger a custom event to refresh the navbar
        window.dispatchEvent(new CustomEvent('profileUpdated'))
        // Reload the page after alert
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setProfileImage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <AfterLogin />
      <div className="edit-profile-container">
        <div className="sidebar">
          <nav>
            <ul className="nav-menu">
              <li><a href="#" className="nav-item active">Account</a></li>
              <li><a href="#" className="nav-item">All Categories</a></li>
              <li><a href="#" className="nav-item">Connected bank accounts</a></li>
              <li><a href="#" className="nav-item">Support</a></li>
            </ul>
          </nav>
        </div>
        
        <div className="main-content">
          <form onSubmit={handleSubmit} className="profile-form">
            <fieldset className="form-section">
              <legend>Account Settings</legend>
              
              <div className="profile-photo-section">
                <label>Profile photo</label>
                <div className="photo-controls">
                  <div className="avatar-container">
                    <img src={profileImage || 'https://via.placeholder.com/80x80?text=No+Image'} alt="Profile" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button type="button" className="upload-btn" onClick={handleFileUpload}>Upload photo</button>
                  <button type="button" className="remove-btn" onClick={handleRemovePhoto}>🗑️</button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email">E-mail address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="E-mail address"
                />
              </div>
            </fieldset>

            <fieldset className="form-section">
              <legend>Localization settings</legend>
              
              <div className="form-field">
                <label htmlFor="currency">Account currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" className="update-btn">Update my settings</button>
            </div>
          </form>

          <div className="danger-zone">
            <hr />
            <a href="#" className="delete-account">Delete account</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Editprofile
