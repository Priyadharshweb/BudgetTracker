import React from 'react'
import BeforeLoginNav from '../navigationBar/BeforeLoginNav'


const Home = () => {
  return (
    <div>
      <BeforeLoginNav/>
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        marginTop: '80px',
        minHeight: '100vh'
      }}>
        <h1>Welcome to Budget Tracker</h1>
        <p>Manage your finances with ease</p>
      </div>
    </div>
  )
}

export default Home