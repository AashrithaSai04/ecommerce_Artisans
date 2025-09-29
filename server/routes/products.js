const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  searchProducts
} = require('../controllers/products');

const { protect, isSeller } = require('../middleware/auth');
const { uploadProductImages, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, isSeller, uploadProductImages, handleMulterError, createProduct);
router.put('/:id', protect, uploadProductImages, handleMulterError, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;