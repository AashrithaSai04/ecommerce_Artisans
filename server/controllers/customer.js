const Review = require('../models/Review');
const CommunityPost = require('../models/CommunityPost');
const SupportTicket = require('../models/SupportTicket');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res) => {
  try {
    const {
      productId,
      orderId,
      rating,
      title,
      comment,
      qualityRating,
      craftmanshipRating,
      valueForMoneyRating,
      deliveryRating,
      images
    } = req.body;

    const customerId = req.user.id;

    // Check if review already exists for this order item
    const existingReview = await Review.findOne({
      product: productId,
      customer: customerId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order item'
      });
    }

    // Get product to find artisan
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const review = await Review.create({
      product: productId,
      customer: customerId,
      artisan: product.seller,
      order: orderId,
      rating,
      title,
      comment,
      qualityRating,
      craftmanshipRating,
      valueForMoneyRating,
      deliveryRating,
      images: images || []
    });

    await review.populate('customer', 'name profile.avatar');
    await review.populate('product', 'name images');

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': avgRating,
      'ratings.count': reviews.length
    });

    // Update artisan rating
    const User = require('../models/User');
    const artisanReviews = await Review.find({ artisan: product.seller });
    const artisanAvgRating = artisanReviews.reduce((acc, rev) => acc + rev.rating, 0) / artisanReviews.length;
    
    await User.findByIdAndUpdate(product.seller, {
      'artisanInfo.rating': artisanAvgRating,
      'artisanInfo.totalRatings': artisanReviews.length
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

    let sortOption = { createdAt: -1 };
    if (sortBy === 'rating-high') sortOption = { rating: -1 };
    if (sortBy === 'rating-low') sortOption = { rating: 1 };
    if (sortBy === 'helpful') sortOption = { 'helpfulVotes.length': -1 };

    const reviews = await Review.find({ product: productId })
      .populate('customer', 'name profile.avatar')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ product: productId });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful/unhelpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Remove existing vote if any
    review.helpfulVotes = review.helpfulVotes.filter(vote => 
      vote.user.toString() !== userId
    );

    // Add new vote
    review.helpfulVotes.push({
      user: userId,
      helpful
    });

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create community post
// @route   POST /api/community/posts
// @access  Private (Artisan)
exports.createCommunityPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user.id
    };

    const post = await CommunityPost.create(postData);
    await post.populate('author', 'name artisanInfo.shopName profile.avatar');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Public
exports.getCommunityPosts = async (req, res) => {
  try {
    const { 
      type, 
      category, 
      page = 1, 
      limit = 10, 
      search,
      language = 'en'
    } = req.query;

    let query = { status: 'published' };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (language) query.language = language;
    
    if (search) {
      query.$text = { $search: search };
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name artisanInfo.shopName artisanInfo.craftSpecialties profile.avatar')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CommunityPost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Like/Unlike community post
// @route   POST /api/community/posts/:postId/like
// @access  Private
exports.likeCommunityPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = post.likes.find(like => 
      like.user.toString() === userId
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => 
        like.user.toString() !== userId
      );
    } else {
      // Like
      post.likes.push({ user: userId });
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        liked: !existingLike,
        likesCount: post.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createSupportTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      customer: req.user.id
    };

    const ticket = await SupportTicket.create(ticketData);
    await ticket.populate('customer', 'name email profile.phone');

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user's support tickets
// @route   GET /api/support/tickets
// @access  Private
exports.getSupportTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = { customer: userId };
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .populate('order', 'orderNumber')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = exports;