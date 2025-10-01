const express = require('express');
const {
  getDashboard,
  updateProfile,
  getOrders,
  updateOrderStatus,
  getAnalytics,
  getReviews
} = require('../controllers/artisan');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('artisan'));

// Dashboard routes
router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);

// Order management
router.get('/orders', getOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Analytics
router.get('/analytics', getAnalytics);

// Reviews
router.get('/reviews', getReviews);

module.exports = router;