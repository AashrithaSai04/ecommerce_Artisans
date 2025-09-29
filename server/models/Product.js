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
      'fresh-food',
      'vegetables',
      'fruits',
      'grains',
      'dairy',
      'meat',
      'handmade-crafts',
      'textiles',
      'pottery',
      'jewelry',
      'woodwork',
      'local-art',
      'paintings',
      'sculptures',
      'photography',
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
    dimensions: String,
    material: String,
    origin: String,
    organic: Boolean,
    handmade: Boolean
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
  translations: {
    es: {
      name: String,
      description: String
    },
    fr: {
      name: String,
      description: String
    },
    hi: {
      name: String,
      description: String
    },
    zh: {
      name: String,
      description: String
    }
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