import React, { useState, useEffect } from 'react';
import { artisanService, analyticsService } from '../../services';
import './ArtisanDashboard.css';

const ArtisanDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await artisanService.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsService.getSalesData(selectedPeriod);
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="artisan-dashboard">
      <div className="dashboard-header">
        <div className="artisan-info">
          <h1>Welcome back, {dashboardData?.artisan?.name}!</h1>
          <div className="shop-info">
            <h2>{dashboardData?.artisan?.shopName}</h2>
            <div className="artisan-badges">
              {dashboardData?.artisan?.verified && (
                <span className="badge verified">✓ Verified</span>
              )}
              <span className="badge rating">
                ⭐ {dashboardData?.artisan?.rating?.toFixed(1)} 
                ({dashboardData?.artisan?.totalRatings} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="quick-actions">
          <button className="btn-primary">Add New Product</button>
          <button className="btn-secondary">View Orders</button>
          <button className="btn-outline">Update Profile</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{dashboardData?.statistics?.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{dashboardData?.statistics?.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{dashboardData?.statistics?.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{dashboardData?.statistics?.totalEarnings?.toLocaleString()}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="left-column">
          <div className="section">
            <div className="section-header">
              <h3>Recent Orders</h3>
              <a href="/artisan/orders" className="view-all">View All</a>
            </div>
            <div className="orders-list">
              {dashboardData?.recentOrders?.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <div className="order-number">#{order.orderNumber}</div>
                    <div className="customer-name">{order.customer.name}</div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="order-status">
                    <span className={`status ${order.status}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="order-total">
                    ₹{order.items.reduce((sum, item) => sum + item.total, 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Low Stock Alert</h3>
            </div>
            <div className="low-stock-list">
              {dashboardData?.lowStockProducts?.map(product => (
                <div key={product._id} className="low-stock-item">
                  <div className="product-name">{product.name}</div>
                  <div className="stock-info">
                    <span className="stock-count">
                      {product.inventory.quantity} {product.inventory.unit}
                    </span>
                    <span className="stock-status low">Low Stock</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="section">
            <div className="section-header">
              <h3>Sales Analytics</h3>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-selector"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div className="analytics-chart">
              {/* Chart component would go here */}
              <div className="chart-placeholder">
                <p>Sales chart for {selectedPeriod}</p>
                {analytics?.salesData && (
                  <div className="chart-summary">
                    <p>Total Sales: ₹{analytics.salesData.reduce((sum, day) => sum + day.sales, 0)}</p>
                    <p>Total Orders: {analytics.salesData.reduce((sum, day) => sum + day.orders, 0)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Top Performing Products</h3>
            </div>
            <div className="top-products-list">
              {analytics?.productPerformance?.slice(0, 5).map(product => (
                <div key={product._id} className="product-performance-item">
                  <div className="product-name">{product.productName}</div>
                  <div className="performance-stats">
                    <span>₹{product.totalSales}</span>
                    <span>{product.totalQuantity} sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Monthly Earnings</h3>
            </div>
            <div className="monthly-earnings">
              {dashboardData?.monthlyEarnings?.slice(0, 6).map(month => (
                <div key={`${month._id.year}-${month._id.month}`} className="earning-item">
                  <div className="month">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="amount">₹{month.earnings}</div>
                  <div className="orders">{month.orders} orders</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;