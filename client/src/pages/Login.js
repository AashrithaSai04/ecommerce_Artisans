import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get the redirect path from state, default to home
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by the auth context
    } catch (error) {
      setErrors({
        submit: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">{t('auth.login')}</h1>
            <p className="auth-subtitle">
              Welcome back to Rural Marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.submit && (
              <div className="error-banner">
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  t('auth.signIn')
                )}
              </button>
            </div>

            <div className="auth-links">
              <Link to="/forgot-password" className="auth-link">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="auth-footer-link">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-image">
          <div className="auth-image-content">
            <h2 className="auth-image-title">
              Connect with Rural Producers
            </h2>
            <p className="auth-image-text">
              Join thousands of customers discovering fresh, authentic products 
              directly from farmers and artisans around the world.
            </p>
            <div className="auth-image-features">
              <div className="feature-item">
                <span className="feature-icon">🌱</span>
                <span>Fresh & Organic</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <span>Direct from Producers</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <span>Global Marketplace</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;