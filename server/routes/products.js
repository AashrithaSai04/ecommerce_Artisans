const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  searchProducts,
  getCategories
} = require('../controllers/products');

const { protect, isArtisan } = require('../middleware/auth');
const { uploadProductImages, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, isArtisan, uploadProductImages, handleMulterError, createProduct);
router.put('/:id', protect, uploadProductImages, handleMulterError, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;