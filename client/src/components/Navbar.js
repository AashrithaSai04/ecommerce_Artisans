import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">Ghao se Ghar thak</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            <Link to="/" className="nav-link">{t('nav.home')}</Link>
            <Link to="/products" className="nav-link">{t('nav.products')}</Link>
            <Link to="/sellers" className="nav-link">{t('nav.sellers')}</Link>
          </div>

          {/* Right Side */}
          <div className="nav-actions">
            <LanguageSelector />
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="nav-link cart-link">
                  <span className="cart-icon">🛒</span>
                  {itemCount > 0 && (
                    <span className="cart-badge">{itemCount}</span>
                  )}
                  <span className="cart-text">{t('nav.cart')}</span>
                </Link>

                <div className="user-menu">
                  <button className="user-button">
                    <span className="user-avatar">
                      {user?.profile?.avatar ? (
                        <img src={user.profile.avatar} alt="Avatar" />
                      ) : (
                        <span className="avatar-placeholder">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="user-name">{user?.name}</span>
                  </button>
                  
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      {t('nav.profile')}
                    </Link>
                    {(user?.role === 'seller' || user?.role === 'admin') && (
                      <Link to="/dashboard" className="dropdown-item">
                        {t('nav.dashboard')}
                      </Link>
                    )}
                    <Link to="/orders" className="dropdown-item">
                      {t('nav.orders')}
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-outline btn-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
              <span className="hamburger"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.products')}
            </Link>
            <Link to="/sellers" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.sellers')}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.cart')} {itemCount > 0 && `(${itemCount})`}
                </Link>
                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.profile')}
                </Link>
                {(user?.role === 'seller' || user?.role === 'admin') && (
                  <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.dashboard')}
                  </Link>
                )}
                <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.orders')}
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;