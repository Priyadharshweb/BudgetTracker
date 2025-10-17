import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import UserDashboard from './userProfiles/UserDashboard'
import Features from './components/Features'
import AboutUs from './components/AboutUs'
import Editprofile from './userProfiles/Editprofile'
import Transaction from './userProfiles/Transaction'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error?.message || 'Something went wrong'}</div>;
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/features" element={<Features/>}/>
        <Route path="/aboutUs" element={<AboutUs/>}/>
        <Route path='/userDashboard' element={<UserDashboard/>}/>
        <Route path="/editProfile" element={<Editprofile />} />
        <Route path="/transaction" element={<Transaction/>}/>
      </Routes>
    </ErrorBoundary>
  )
}

export default App