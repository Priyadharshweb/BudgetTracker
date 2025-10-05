import React from 'react';
import './Home.css';
import BeforeLoginNav from '../navigationBar/BeforeLoginNav';
import AfterLogin from '../navigationBar/AfterLogin';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'Shared wallets',
    desc: 'are popular among couples, families and roommates who handle their finances in Spendee.',
  },
  {
    title: 'Connecting bank accounts',
    desc: 'to Spendee is preferred by people paying mostly by card.',
  },
  {
    title: 'Customize Spendee',
    desc: 'Customize your categories, add a picture or a location to every expense.',
  },
  {
    title: 'Multiple currencies',
    desc: 'are favoured by travellers and digital nomads managing money in more currencies.',
  },
  {
    title: 'Alerts and reminders',
    desc: 'will notify you to pay the bill or not to exceed the budget.',
  },
  {
    title: 'Sync and backup',
    desc: 'is valuable for everyone using Spendee across devices and sharing Spendee with others.',
  },
];

const Home = () => {
  const navigate=useNavigate();
  const { isAuthenticated } = useAuth();
  const handleExplore=()=>{
    navigate("/signup")
  };
  return (
    <div>
      {isAuthenticated ? <AfterLogin /> : <BeforeLoginNav />}

      {/* Hero Section with Background Image */}
      <div className="hero-section">
        <h1 className="hero-title">
          Welcome 
          <br/>
          to Your Smart Budget!<br />
          <b>worldwide to get their money into shape.</b>
          <br></br>
        <button onClick={handleExplore}>Explore</button>
        </h1>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="features-title">Features our users love</h2>
        <div className="features-cards">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <div className="feature-title">{feature.title}</div>
              <div className="feature-desc">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
