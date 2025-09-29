const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).populate('seller');
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.product} not found`
        });
      }

      if (!product.inventory.inStock || product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        seller: product.seller._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });

      // Update product inventory
      product.inventory.quantity -= item.quantity;
      if (product.inventory.quantity === 0) {
        product.inventory.inStock = false;
      }
      await product.save();
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax (adjust as needed)
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shipping;

    const orderData = {
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentInfo,
      orderSummary: {
        subtotal,
        tax,
        shipping,
        total
      }
    };

    const order = await Order.create(orderData);

    await order.populate([
      {
        path: 'customer',
        select: 'name email profile'
      },
      {
        path: 'items.product',
        select: 'name images'
      },
      {
        path: 'items.seller',
        select: 'name sellerInfo'
      }
    ]);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders (admin) or seller's orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query = {};

    // If not admin, filter by user role
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'seller') {
      query['items.seller'] = req.user.id;
    }

    const orders = await Order.find(query)
      .populate([
        {
          path: 'customer',
          select: 'name email profile'
        },
        {
          path: 'items.product',
          select: 'name images'
        },
        {
          path: 'items.seller',
          select: 'name sellerInfo'
        }
      ])
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        {
          path: 'customer',
          select: 'name email profile'
        },
        {
          path: 'items.product',
          select: 'name images price'
        },
        {
          path: 'items.seller',
          select: 'name sellerInfo'
        }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    const hasAccess = 
      req.user.role === 'admin' ||
      order.customer._id.toString() === req.user.id ||
      order.items.some(item => item.seller._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingInfo } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      req.user.role === 'admin' ||
      order.items.some(item => item.seller.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update order
    order.status = status;
    if (note) {
      order.notes = note;
    }
    if (trackingInfo) {
      order.trackingInfo = { ...order.trackingInfo, ...trackingInfo };
    }

    // Add to order history
    order.orderHistory.push({
      status,
      note,
      updatedBy: req.user.id,
      timestamp: new Date()
    });

    await order.save();

    await order.populate([
      {
        path: 'customer',
        select: 'name email profile'
      },
      {
        path: 'items.product',
        select: 'name images'
      },
      {
        path: 'items.seller',
        select: 'name sellerInfo'
      }
    ]);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer/Admin)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    // Restore product inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.inventory.quantity += item.quantity;
        product.inventory.inStock = true;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.orderHistory.push({
      status: 'cancelled',
      note: req.body.reason || 'Order cancelled by customer',
      updatedBy: req.user.id,
      timestamp: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (Seller/Admin)
exports.getOrderStats = async (req, res, next) => {
  try {
    let matchStage = {};

    // Filter by seller if not admin
    if (req.user.role === 'seller') {
      matchStage['items.seller'] = req.user._id;
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$orderSummary.total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments(matchStage);
    const totalRevenue = await Order.aggregate([
      { $match: { ...matchStage, status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$orderSummary.total' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};