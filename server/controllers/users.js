const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Public
exports.getSellers = async (req, res, next) => {
  try {
    const sellers = await User.find({ 
      role: 'seller',
      isActive: true 
    }).select('name profile sellerInfo');

    res.status(200).json({
      success: true,
      count: sellers.length,
      data: sellers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single seller profile
// @route   GET /api/sellers/:id
// @access  Public
exports.getSeller = async (req, res, next) => {
  try {
    const seller = await User.findOne({
      _id: req.params.id,
      role: 'seller',
      isActive: true
    }).select('name profile sellerInfo');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update seller profile
// @route   PUT /api/sellers/profile
// @access  Private (Seller only)
exports.updateSellerProfile = async (req, res, next) => {
  try {
    const { sellerInfo, profile } = req.body;

    const user = await User.findById(req.user.id);

    if (user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Seller account required.'
      });
    }

    const updateData = {};
    if (sellerInfo) updateData.sellerInfo = { ...user.sellerInfo, ...sellerInfo };
    if (profile) updateData.profile = { ...user.profile, ...profile };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'profile.avatar': avatarPath },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: {
        avatar: avatarPath,
        user
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