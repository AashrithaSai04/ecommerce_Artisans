const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    maxLength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxLength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'pottery',
      'weaving', 
      'woodwork',
      'metalwork',
      'jewelry',
      'textiles',
      'embroidery',
      'painting',
      'sculpture',
      'leather-work',
      'bamboo-craft',
      'stone-carving',
      'glass-work',
      'paper-craft',
      'handloom',
      'block-printing',
      'organic-produce',
      'processed-foods',
      'home-decor',
      'traditional-wear',
      'accessories',
      'other'
    ]
  },
  subcategory: {
    type: String,
    maxLength: [50, 'Subcategory cannot be more than 50 characters']
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    alt: String
  }],
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Please add quantity'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Please specify unit'],
      enum: ['kg', 'g', 'lb', 'piece', 'dozen', 'liter', 'ml', 'bunch', 'bag']
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  specifications: {
    weight: String,
    dimensions: {
      length: String,
      width: String,
      height: String
    },
    materials: [String],
    techniques: [String],
    origin: {
      village: String,
      district: String,
      state: String
    },
    colors: [String],
    patterns: [String],
    isOrganic: Boolean,
    isHandmade: {
      type: Boolean,
      default: true
    },
    isFairTrade: Boolean,
    timeToMake: String, // e.g., "2-3 days", "1 week"
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'master']
    },
    culturalSignificance: String,
    careInstructions: String
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'fragile', 'perishable', 'heavy'],
      default: 'standard'
    },
    processingTime: {
      type: String,
      default: '1-2 days'
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Customization options
  customizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: [{
    name: String, // e.g., "Color", "Size", "Pattern"
    type: {
      type: String,
      enum: ['text', 'color', 'size', 'dropdown', 'checkbox']
    },
    options: [String], // Available options for dropdown/checkbox
    required: Boolean,
    additionalCost: Number
  }],
  
  // Availability and timing
  availability: {
    type: String,
    enum: ['in-stock', 'made-to-order', 'pre-order', 'out-of-stock'],
    default: 'in-stock'
  },
  leadTime: String, // For made-to-order items
  
  // Reviews and ratings
  reviews: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Review'
  }],
  
  // Related products
  relatedProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  
  // SEO and discoverability
  seoKeywords: [String],
  searchTags: [String],
  
  // Multilingual support
  translations: {
    hi: {
      name: String,
      description: String,
      tags: [String]
    },
    te: {
      name: String,
      description: String,
      tags: [String]
    },
    bn: {
      name: String,
      description: String,
      tags: [String]
    }
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update inventory status based on quantity
productSchema.pre('save', function(next) {
  this.inventory.inStock = this.inventory.quantity > 0;
  next();
});

module.exports = mongoose.model('Product', productSchema);