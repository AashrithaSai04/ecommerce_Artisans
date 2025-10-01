import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SellerProductManager from './SellerProductManager';
import SellerOrderManager from './SellerOrderManager';
import ArtisanDashboard from '../Artisan/ArtisanDashboard';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    setActiveTab(path || 'dashboard');
  }, [location]);

  const navigationItems = [
    {
      id: 'dashboard',
      path: '/seller/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview and analytics'
    },
    {
      id: 'products',
      path: '/seller/products',
      icon: '📦',
      label: 'Products',
      description: 'Manage your inventory'
    },
    {
      id: 'orders',
      path: '/seller/orders',
      icon: '📋',
      label: 'Orders',
      description: 'Track customer orders'
    },
    {
      id: 'analytics',
      path: '/seller/analytics',
      icon: '📈',
      label: 'Analytics',
      description: 'Sales performance'
    },
    {
      id: 'profile',
      path: '/seller/profile',
      icon: '👤',
      label: 'Profile',
      description: 'Shop settings'
    }
  ];

  const QuickActions = () => (
    <div className="quick-actions-panel">
      <h3>Quick Actions</h3>
      <div className="action-buttons">
        <Link to="/seller/products" className="action-btn primary">
          <span className="action-icon">➕</span>
          <div className="action-content">
            <span className="action-title">Add Product</span>
            <span className="action-desc">List a new handicraft</span>
          </div>
        </Link>
        
        <Link to="/seller/orders" className="action-btn secondary">
          <span className="action-icon">📋</span>
          <div className="action-content">
            <span className="action-title">Check Orders</span>
            <span className="action-desc">Review pending orders</span>
          </div>
        </Link>

        <Link to="/seller/analytics" className="action-btn tertiary">
          <span className="action-icon">📈</span>
          <div className="action-content">
            <span className="action-title">View Analytics</span>
            <span className="action-desc">Track your performance</span>
          </div>
        </Link>

        <Link to="/seller/profile" className="action-btn quaternary">
          <span className="action-icon">⚙️</span>
          <div className="action-content">
            <span className="action-title">Update Profile</span>
            <span className="action-desc">Manage shop details</span>
          </div>
        </Link>
      </div>
    </div>
  );

  const SellerWelcome = () => (
    <div className="seller-welcome">
      <div className="welcome-header">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <div className="shop-info">
            <h2>{user?.artisanInfo?.shopName || 'Your Handicraft Shop'}</h2>
            <div className="seller-badges">
              {user?.artisanInfo?.verified && (
                <span className="badge verified">✅ Verified Artisan</span>
              )}
              <span className="badge rating">
                ⭐ {user?.artisanInfo?.rating?.toFixed(1) || '0.0'} 
                ({user?.artisanInfo?.totalRatings || 0} reviews)
              </span>
              <span className="badge specialties">
                🎨 {user?.artisanInfo?.craftSpecialties?.join(', ') || 'Handicrafts'}
              </span>
            </div>
          </div>
        </div>
        <div className="welcome-actions">
          <Link to="/seller/products" className="btn-primary">
            + Add New Product
          </Link>
          <Link to="/products" className="btn-secondary" target="_blank">
            View My Shop
          </Link>
        </div>
      </div>

      <div className="seller-tips">
        <h3>💡 Tips to Boost Your Sales</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📸</div>
            <h4>High-Quality Photos</h4>
            <p>Upload clear, well-lit photos showing your product details and craftsmanship.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h4>Detailed Descriptions</h4>
            <p>Tell the story behind your craft, materials used, and cultural significance.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">💰</div>
            <h4>Competitive Pricing</h4>
            <p>Research similar products and price fairly while valuing your craftsmanship.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⚡</div>
            <h4>Quick Responses</h4>
            <p>Respond to customer inquiries and process orders promptly to build trust.</p>
          </div>
        </div>
      </div>

      <QuickActions />
    </div>
  );

  return (
    <div className="seller-dashboard-container">
      <div className="seller-sidebar">
        <div className="sidebar-header">
          <div className="seller-avatar">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="seller-info">
            <h3>{user?.name}</h3>
            <p className="seller-role">Artisan Seller</p>
            <p className="seller-location">
              {user?.profile?.address?.city}, {user?.profile?.address?.state}
            </p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="help-section">
            <h4>Need Help?</h4>
            <p>Contact our seller support team</p>
            <button className="btn-help">
              📞 Get Support
            </button>
          </div>
        </div>
      </div>

      <div className="seller-main-content">
        <Routes>
          <Route path="/" element={<SellerWelcome />} />
          <Route path="/dashboard" element={<ArtisanDashboard />} />
          <Route path="/products" element={<SellerProductManager />} />
          <Route path="/orders" element={<SellerOrderManager />} />
          <Route path="/analytics" element={<ArtisanDashboard />} />
          <Route path="/profile" element={<div>Profile Management Coming Soon</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default SellerDashboard;