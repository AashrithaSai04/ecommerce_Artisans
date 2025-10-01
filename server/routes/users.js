const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getArtisans,
  getSellers,
  getSeller,
  updateSellerProfile,
  uploadAvatar
} = require('../controllers/users');
const { getProductsBySeller } = require('../controllers/products');

const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/artisans', getArtisans);

// Public seller routes
router.get('/sellers', getSellers);
router.get('/sellers/:id', getSeller);
router.get('/sellers/:sellerId/products', getProductsBySeller);

// Protected routes
router.use(protect);

// User profile routes
router.put('/avatar', uploadAvatarMiddleware, handleMulterError, uploadAvatar);
router.put('/sellers/profile', updateSellerProfile);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;