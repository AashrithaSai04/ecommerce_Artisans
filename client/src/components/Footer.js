import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌾 Rural Marketplace</h3>
            <p>Connecting rural producers with global customers</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>{t('footer.aboutUs')}</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/mission">Our Mission</a></li>
              <li><a href="/team">Team</a></li>
              <li><a href="/careers">Careers</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">{t('footer.helpCenter')}</a></li>
              <li><a href="/contact">{t('footer.contactUs')}</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/terms">{t('footer.terms')}</a></li>
              <li><a href="/privacy">{t('footer.privacy')}</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/refunds">Refund Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t('footer.newsletter')}</h4>
            <p>{t('footer.subscribeNewsletter')}</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder={t('footer.enterEmail')}
                className="newsletter-input"
              />
              <button className="newsletter-btn">{t('footer.subscribe')}</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2023 {t('footer.ruralMarketplace')}. {t('footer.allRightsReserved')}.
          </p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: var(--primary-dark);
          color: var(--text-light);
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3,
        .footer-section h4 {
          margin-bottom: 1rem;
          color: var(--text-light);
        }

        .footer-section h3 {
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-section p {
          color: #b0b0b0;
          margin-bottom: 1rem;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .footer-section ul li a {
          color: #b0b0b0;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-section ul li a:hover {
          color: var(--text-light);
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-links a {
          display: inline-block;
          font-size: 1.5rem;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .social-links a:hover {
          transform: scale(1.1);
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-light);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .newsletter-input::placeholder {
          color: #b0b0b0;
        }

        .newsletter-input:focus {
          outline: none;
          border-color: var(--primary-light);
          background-color: rgba(255, 255, 255, 0.15);
        }

        .newsletter-btn {
          padding: 0.75rem 1.5rem;
          background-color: var(--secondary-color);
          color: var(--text-light);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }

        .newsletter-btn:hover {
          background-color: var(--secondary-light);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 1rem;
          text-align: center;
          color: #b0b0b0;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 2rem 0 1rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-btn {
            align-self: flex-start;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;