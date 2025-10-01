const express = require('express');
const {
  createReview,
  getProductReviews,
  markReviewHelpful,
  createCommunityPost,
  getCommunityPosts,
  likeCommunityPost,
  createSupportTicket,
  getSupportTickets
} = require('../controllers/customer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Review routes
router.post('/reviews', protect, createReview);
router.get('/reviews/product/:productId', getProductReviews);
router.post('/reviews/:reviewId/helpful', protect, markReviewHelpful);

// Community routes
router.post('/community/posts', protect, createCommunityPost);
router.get('/community/posts', getCommunityPosts);
router.post('/community/posts/:postId/like', protect, likeCommunityPost);

// Support routes
router.post('/support/tickets', protect, createSupportTicket);
router.get('/support/tickets', protect, getSupportTickets);

module.exports = router;