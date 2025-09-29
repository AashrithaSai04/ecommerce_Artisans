const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    maxLength: [50, 'Name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    maxLength: [500, 'Description cannot be more than 500 characters']
  },
  icon: String,
  image: String,
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  productCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
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
  }
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);