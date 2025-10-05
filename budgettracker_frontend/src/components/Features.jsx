import React from 'react';
import './Features.css';
import BeforeLoginNav from '../navigationBar/BeforeLoginNav';
import AfterLogin from '../navigationBar/AfterLogin';
import { useAuth } from '../context/AuthContext';

const Features = () => {
  const { isAuthenticated } = useAuth();
  const rightImage =
    'https://plus.unsplash.com/premium_photo-1661306416293-e3ab553eb73a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGlnaXRhbCUyMGJhbmt8ZW58MHx8MHx8fDA%3D';

  return (
    <>
      {isAuthenticated ? <AfterLogin /> : <BeforeLoginNav />}

      {/* Top Section */}
      <div className="features-container">
        <div className="features-left">
          <h2>
            Link your bank to <span className="highlight">Fast Budget</span>
          </h2>
          <p>Harness the power of automation.</p>
          <p>Let our app sync your bank data for you.</p>
          <p>Effortlessly sort your spending with our automatic categorization feature.</p>
        </div>
        <div className="features-right">
          <img src={rightImage} alt="Finance Illustration" className="right-image" />
        </div>
      </div>

      {/* Cards Section */}
      <section className="cards-section">
        <h3 className="cards-heading">Great budget software</h3>

        <div className="feature-cards-container">
          <div className="feature-card">
            <img
              src="https://goodbudget.com/wp-content/uploads/2019/04/01215544/ic-budgeting-that-works.svg"
              alt="Budgeting"
            />
            <h4>Budgeting<br />that works</h4>
          </div>

          <div className="feature-card">
            <img
              src="https://goodbudget.com/wp-content/uploads/2019/06/10155313/whatyouget-sync-and-share-couple-300x251.png"
              alt="Sync & Share"
            />
            <h4>Sync &<br />share budgets</h4>
          </div>

          <div className="feature-card">
            <img
              src="https://goodbudget.com/wp-content/uploads/2019/04/01215543/ic-save-for-big-expenses.svg"
              alt="Save for big expenses"
            />
            <h4>Save for<br />big expenses</h4>
          </div>

          <div className="feature-card">
            <img
              src="https://goodbudget.com/wp-content/uploads/2019/04/01215543/ic-pay-off-debt.svg"
              alt="Pay off debt"
            />
            <h4>Pay off<br />debt</h4>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
