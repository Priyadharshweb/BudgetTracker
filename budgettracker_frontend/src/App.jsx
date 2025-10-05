import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import UserDashboard from './userProfiles/UserDashboard'
import Features from './components/Features'
import AboutUs from './components/AboutUs'
import Editprofile from './userProfiles/Editprofile'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/features" element={<Features/>}/>
      <Route path="/aboutUs" element={<AboutUs/>}/>
      <Route path='/userDashboard' element={<UserDashboard/>}/>
      <Route path="/editProfile" element={<Editprofile />} />
    </Routes>
  )
}

export default App
