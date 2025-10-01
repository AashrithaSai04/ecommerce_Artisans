const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Get artisan dashboard data
// @route   GET /api/artisan/dashboard
// @access  Private (Artisan)
exports.getDashboard = async (req, res) => {
  try {
    const artisanId = req.user.id;

    // Get artisan info
    const artisan = await User.findById(artisanId).select('-password');
    
    // Get product count
    const totalProducts = await Product.countDocuments({ seller: artisanId, isActive: true });
    
    // Get order statistics
    const totalOrders = await Order.countDocuments({ 'items.seller': artisanId });
    const pendingOrders = await Order.countDocuments({ 
      'items.seller': artisanId, 
      status: { $in: ['pending', 'confirmed', 'artisan-accepted'] }
    });
    const completedOrders = await Order.countDocuments({ 
      'items.seller': artisanId, 
      status: 'delivered' 
    });

    // Get recent orders
    const recentOrders = await Order.find({ 'items.seller': artisanId })
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get earnings data
    const earningsData = await Order.aggregate([
      { $match: { 'items.seller': mongoose.Types.ObjectId(artisanId), status: 'delivered' } },
      { $unwind: '$items' },
      { $match: { 'items.seller': mongoose.Types.ObjectId(artisanId) } },
      { $group: { 
        _id: null, 
        totalEarnings: { $sum: '$items.total' },
        totalOrdersDelivered: { $sum: 1 }
      }}
    ]);

    // Get monthly earnings
    const monthlyEarnings = await Order.aggregate([
      { $match: { 'items.seller': mongoose.Types.ObjectId(artisanId), status: 'delivered' } },
      { $unwind: '$items' },
      { $match: { 'items.seller': mongoose.Types.ObjectId(artisanId) } },
      { $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        earnings: { $sum: '$items.total' },
        orders: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get low stock products
    const lowStockProducts = await Product.find({
      seller: artisanId,
      'inventory.quantity': { $lte: 5 },
      isActive: true
    }).select('name inventory.quantity inventory.unit');

    res.status(200).json({
      success: true,
      data: {
        artisan: {
          name: artisan.name,
          shopName: artisan.artisanInfo?.shopName,
          rating: artisan.artisanInfo?.rating,
          totalRatings: artisan.artisanInfo?.totalRatings,
          verified: artisan.artisanInfo?.verified
        },
        statistics: {
          totalProducts,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalEarnings: earningsData[0]?.totalEarnings || 0
        },
        recentOrders,
        monthlyEarnings,
        lowStockProducts
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

// @desc    Update artisan profile
// @route   PUT /api/artisan/profile
// @access  Private (Artisan)
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const artisanId = req.user.id;

    // Build update object
    const updateData = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.profile) updateData.profile = { ...updates.profile };
    if (updates.artisanInfo) updateData.artisanInfo = { ...updates.artisanInfo };

    const artisan = await User.findByIdAndUpdate(
      artisanId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: artisan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Get artisan orders
// @route   GET /api/artisan/orders
// @access  Private (Artisan)
exports.getOrders = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { 'items.seller': artisanId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email profile.phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
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

// @desc    Update order status
// @route   PUT /api/artisan/orders/:orderId/status
// @access  Private (Artisan)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes, estimatedCompletionDate } = req.body;
    const artisanId = req.user.id;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify artisan owns items in this order
    const hasItems = order.items.some(item => 
      item.seller.toString() === artisanId
    );

    if (!hasItems) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update order status and related info
    order.status = status;
    
    if (status === 'artisan-accepted') {
      order.artisanResponse = {
        accepted: true,
        acceptedAt: new Date(),
        notes,
        estimatedCompletionDate
      };
    }

    if (status === 'in-production') {
      order.productionInfo = {
        startedAt: new Date(),
        expectedCompletionDate: estimatedCompletionDate
      };
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get artisan analytics
// @route   GET /api/artisan/analytics
// @access  Private (Artisan)
exports.getAnalytics = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Sales analytics
    const salesData = await Order.aggregate([
      {
        $match: {
          'items.seller': mongoose.Types.ObjectId(artisanId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': mongoose.Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          sales: { $sum: '$items.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Product performance
    const productPerformance = await Order.aggregate([
      {
        $match: {
          'items.seller': mongoose.Types.ObjectId(artisanId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': mongoose.Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.total' },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          totalSales: 1,
          totalQuantity: 1,
          orderCount: 1
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        salesData,
        productPerformance,
        period
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

// @desc    Get artisan reviews
// @route   GET /api/artisan/reviews
// @access  Private (Artisan)
exports.getReviews = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ artisan: artisanId })
      .populate('customer', 'name profile.avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ artisan: artisanId });

    // Calculate average ratings
    const ratingStats = await Review.aggregate([
      { $match: { artisan: mongoose.Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: ratingStats[0] || { averageRating: 0, totalReviews: 0 },
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