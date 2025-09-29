const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orders');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.get('/stats', authorize('seller', 'admin'), getOrderStats);

router.route('/:id')
  .get(getOrder);

router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;