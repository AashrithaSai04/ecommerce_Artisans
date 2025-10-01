import React, { useState, useEffect } from 'react';
import { artisanService } from '../../services';
import './SellerOrderManager.css';

const SellerOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusFilters = [
    { value: 'all', label: 'All Orders', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'confirmed', label: 'Confirmed', count: 0 },
    { value: 'artisan-accepted', label: 'Accepted', count: 0 },
    { value: 'in-production', label: 'In Production', count: 0 },
    { value: 'ready-to-ship', label: 'Ready to Ship', count: 0 },
    { value: 'shipped', label: 'Shipped', count: 0 },
    { value: 'delivered', label: 'Delivered', count: 0 }
  ];

  const orderStatuses = [
    { value: 'pending', label: 'Pending Review', color: '#ffc107' },
    { value: 'confirmed', label: 'Confirmed', color: '#17a2b8' },
    { value: 'artisan-accepted', label: 'Accepted', color: '#28a745' },
    { value: 'in-production', label: 'In Production', color: '#fd7e14' },
    { value: 'ready-to-ship', label: 'Ready to Ship', color: '#6f42c1' },
    { value: 'shipped', label: 'Shipped', color: '#007bff' },
    { value: 'delivered', label: 'Delivered', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await artisanService.getOrders(params);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error loading orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, notes = '', estimatedDate = null) => {
    try {
      setUpdatingStatus(true);
      const updateData = {
        status: newStatus,
        notes,
        ...(estimatedDate && { estimatedCompletionDate: estimatedDate })
      };
      
      await artisanService.updateOrderStatus(orderId, updateData);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6c757d';
  };

  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + item.total, 0);
  };

  const canUpdateStatus = (currentStatus, newStatus) => {
    const statusFlow = [
      'pending', 'confirmed', 'artisan-accepted', 'in-production', 
      'ready-to-ship', 'shipped', 'delivered'
    ];
    
    const currentIndex = statusFlow.indexOf(currentStatus);
    const newIndex = statusFlow.indexOf(newStatus);
    
    return newIndex > currentIndex || newStatus === 'cancelled';
  };

  const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
    const [newStatus, setNewStatus] = useState(order.status);
    const [notes, setNotes] = useState('');
    const [estimatedDate, setEstimatedDate] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate(order._id, newStatus, notes, estimatedDate || null);
      onClose();
    };

    return (
      <div className="modal-overlay">
        <div className="status-modal">
          <div className="modal-header">
            <h3>Update Order Status</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="status-form">
            <div className="form-group">
              <label>New Status</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {orderStatuses
                  .filter(status => canUpdateStatus(order.status, status.value))
                  .map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))
                }
              </select>
            </div>

            {newStatus === 'artisan-accepted' && (
              <div className="form-group">
                <label>Estimated Completion Date</label>
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={(e) => setEstimatedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the customer..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-update" disabled={updatingStatus}>
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const OrderDetailModal = ({ order, onClose }) => (
    <div className="modal-overlay">
      <div className="order-detail-modal">
        <div className="modal-header">
          <h3>Order Details - #{order.orderNumber}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="order-detail-content">
          <div className="order-summary">
            <div className="summary-section">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> {order.customer.name}</p>
              <p><strong>Email:</strong> {order.customer.email}</p>
              <p><strong>Phone:</strong> {order.customer.profile?.phone || 'Not provided'}</p>
            </div>

            <div className="summary-section">
              <h4>Shipping Address</h4>
              <div className="address">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </div>
            </div>

            <div className="summary-section">
              <h4>Order Items</h4>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0].url} alt={item.product.name} />
                      ) : (
                        <div className="no-image">📦</div>
                      )}
                    </div>
                    <div className="item-details">
                      <h5>{item.product.name}</h5>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{item.price}</p>
                      <p className="item-total">Total: ₹{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-section">
              <h4>Payment Information</h4>
              <p><strong>Method:</strong> {order.paymentInfo.method.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Status:</strong> {order.paymentInfo.status.toUpperCase()}</p>
              <p><strong>Total Amount:</strong> ₹{order.orderSummary.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="seller-order-manager">
      <div className="manager-header">
        <div className="header-content">
          <h1>Order Management</h1>
          <p>Manage and track your customer orders</p>
        </div>
        <div className="order-stats">
          <div className="stat-item">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {orders.filter(o => ['pending', 'confirmed', 'artisan-accepted'].includes(o.status)).length}
            </span>
            <span className="stat-label">Pending Action</span>
          </div>
        </div>
      </div>

      <div className="status-filters">
        {statusFilters.map(filter => (
          <button
            key={filter.value}
            className={`filter-btn ${selectedStatus === filter.value ? 'active' : ''}`}
            onClick={() => setSelectedStatus(filter.value)}
          >
            {filter.label}
            <span className="filter-count">
              {filter.value === 'all' 
                ? orders.length 
                : orders.filter(o => o.status === filter.value).length
              }
            </span>
          </button>
        ))}
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📋</div>
            <h3>No Orders Found</h3>
            <p>
              {selectedStatus === 'all' 
                ? "You haven't received any orders yet. Keep promoting your products!"
                : `No orders with status "${getStatusLabel(selectedStatus)}"`
              }
            </p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>#{order.orderNumber}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                  <p className="customer-name">Customer: {order.customer.name}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="order-total">
                  <span className="total-label">Total</span>
                  <span className="total-amount">₹{getOrderTotal(order).toLocaleString()}</span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="item-preview">
                    <div className="item-image-small">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0].url} alt={item.product.name} />
                      ) : (
                        <div className="no-image-small">📦</div>
                      )}
                    </div>
                    <div className="item-info-small">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">+{order.items.length - 3} more</div>
                )}
              </div>

              <div className="order-actions">
                <button 
                  className="btn-view-details"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                >
                  View Details
                </button>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button 
                    className="btn-update-status"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderModal(true);
                    }}
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default SellerOrderManager;