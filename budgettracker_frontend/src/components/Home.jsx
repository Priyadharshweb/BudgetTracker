import React, { useEffect } from 'react';
import './Home.css';
import BeforeLoginNav from '../navigationBar/BeforeLoginNav';
import AfterLogin from '../navigationBar/AfterLogin';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
const Home = () => {
  const navigate=useNavigate();
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated || false;
  
  useEffect(() => {
    if (!isAuthenticated) {
      const preventBack = () => {
        window.history.pushState(null, null, window.location.pathname);
      };
      window.history.pushState(null, null, window.location.pathname);
      window.addEventListener('popstate', preventBack);
      
      return () => {
        window.removeEventListener('popstate', preventBack);
      };
    }
  }, [isAuthenticated]);
  
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
        <div className="hero-image">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/woman-doing-budget-tracking-illustration-svg-download-png-11253792.png" alt="Budget Tracking" />
        </div>
      </div>

      {/* New Features Section */}
      <section className="new-features-section">
        <figure className="feature-figure">
          <figcaption className="feature-caption">
            <h3 className="feature-heading">Simple money tracker</h3>
            <p className="feature-description">
              It takes seconds to record daily transactions. Put them into clear and visualized categories such as Expense: Food, Shopping or Income: Salary, Gift.
            </p>
          </figcaption>
          <div className="feature-image">
            <img src="https://play-lh.googleusercontent.com/pUhXptAcWE-a2Px6R28or8GBOdyDjdAYXrqxGpNX4xNDjX1VDp3hUmaLY773ES_ZiHA=w240-h480-rw" alt="Transaction tracking" />
          </div>
        </figure>
        
        <figure className="feature-figure reverse">
          <figcaption className="feature-caption">
            <h3 className="feature-heading">Painless budgeting</h3>
            <p className="feature-description">
              It takes seconds to record daily transactions. Put them into clear and visualized categories such as Expense: Food, Shopping or Income: Salary, Gift.
            </p>
          </figcaption>
          <div className="feature-image">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3M64NdImwoPoFnyG2dh_3KLvylUUSCtncSA&s" alt="Budget management" />
          </div>
        </figure>
        
        <figure className="feature-figure">
          <figcaption className="feature-caption">
            <h3 className="feature-heading">The whole picture in one place</h3>
            <p className="feature-description">
              One report to give a clear view on your spending patterns. Understand where your money comes and goes with easy-to-read graphs.
            </p>
          </figcaption>
          <div className="feature-image">
            <img src="https://assets.visme.co/templates/banners/thumbnails/i_Personal-Monthly-Budget-Allocation-Bar-Graph_full.jpg" alt="Financial reports" />
          </div>
        </figure>
      </section>
      <Footer/>
    </div>
  );
};

export default Home;
