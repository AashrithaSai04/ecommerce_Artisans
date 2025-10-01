const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all products with advanced filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      priceMin,
      priceMax,
      rating,
      location,
      craftSpecialty,
      materials,
      availability,
      customizable,
      page = 1,
      limit = 20,
      sort = 'newest',
      artisan
    } = req.query;

    // Build base query
    let baseQuery = { isActive: true };

    // Text search across name, description, and tags
    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { 'specifications.materials': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filtering
    if (category) {
      baseQuery.category = category;
    }

    // Price range filtering
    if (priceMin || priceMax) {
      baseQuery.price = {};
      if (priceMin) baseQuery.price.$gte = parseFloat(priceMin);
      if (priceMax) baseQuery.price.$lte = parseFloat(priceMax);
    }

    // Rating filtering
    if (rating) {
      baseQuery['ratings.average'] = { $gte: parseFloat(rating) };
    }

    // Availability filtering
    if (availability) {
      baseQuery.availability = availability;
    }

    // Customizable filtering
    if (customizable === 'true') {
      baseQuery.customizable = true;
    }

    // Materials filtering
    if (materials) {
      const materialArray = materials.split(',');
      baseQuery['specifications.materials'] = { $in: materialArray };
    }

    // Artisan filtering
    if (artisan) {
      baseQuery.seller = artisan;
    }

    // Build aggregation pipeline for location and craft specialty filtering
    let pipeline = [{ $match: baseQuery }];

    // Add seller lookup for location and craft specialty filtering
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'seller',
        foreignField: '_id',
        as: 'seller'
      }
    });

    pipeline.push({ $unwind: '$seller' });

    // Location filtering (by seller's location)
    if (location) {
      pipeline.push({
        $match: {
          $or: [
            { 'seller.profile.address.city': { $regex: location, $options: 'i' } },
            { 'seller.profile.address.state': { $regex: location, $options: 'i' } }
          ]
        }
      });
    }

    // Craft specialty filtering
    if (craftSpecialty) {
      pipeline.push({
        $match: {
          'seller.artisanInfo.craftSpecialties': { $in: [craftSpecialty] }
        }
      });
    }

    // Add sorting
    let sortOption = {};
    switch (sort) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { 'ratings.average': -1 };
        break;
      case 'popular':
        sortOption = { 'ratings.count': -1, viewCount: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    pipeline.push({ $sort: sortOption });

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const totalResult = await Product.aggregate(countPipeline);
    const totalCount = totalResult[0]?.total || 0;

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Select specific fields
    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        price: 1,
        category: 1,
        images: 1,
        'inventory.quantity': 1,
        'inventory.unit': 1,
        'inventory.inStock': 1,
        ratings: 1,
        tags: 1,
        specifications: 1,
        availability: 1,
        customizable: 1,
        viewCount: 1,
        wishlistCount: 1,
        createdAt: 1,
        'seller._id': 1,
        'seller.name': 1,
        'seller.artisanInfo.shopName': 1,
        'seller.artisanInfo.rating': 1,
        'seller.artisanInfo.verified': 1,
        'seller.profile.address.city': 1,
        'seller.profile.address.state': 1
      }
    });

    const productResults = await Product.aggregate(pipeline);

    // Pagination result
    const paginationInfo = {
      current: parseInt(page),
      pages: Math.ceil(totalCount / parseInt(limit)),
      total: totalCount
    };

    res.status(200).json({
      success: true,
      count: productResults.length,
      pagination: paginationInfo,
      data: productResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: 'seller',
      select: 'name sellerInfo profile'
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Sellers only)
exports.createProduct = async (req, res, next) => {
  try {
    // Add seller to req.body
    req.body.seller = req.user.id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name || 'Product image'
      }));
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner only)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Make sure user is product owner
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name || product.name
      }));
      
      // Add new images to existing ones or replace them
      if (req.body.replaceImages === 'true') {
        req.body.images = newImages;
      } else {
        req.body.images = [...(product.images || []), ...newImages];
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Make sure user is product owner
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

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

// @desc    Get products by seller
// @route   GET /api/sellers/:sellerId/products
// @access  Public
exports.getProductsBySeller = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      seller: req.params.sellerId,
      isActive: true
    }).populate({
      path: 'seller',
      select: 'name sellerInfo profile'
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, inStock } = req.query;

    let query = {};

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // In stock filter
    if (inStock === 'true') {
      query['inventory.inStock'] = true;
    }

    // Only show active products
    query.isActive = true;

    const products = await Product.find(query)
      .populate({
        path: 'seller',
        select: 'name sellerInfo profile'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};