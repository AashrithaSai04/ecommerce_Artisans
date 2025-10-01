const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxLength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxLength: [5000, 'Content cannot be more than 5000 characters']
  },
  type: {
    type: String,
    enum: ['story', 'tutorial', 'showcase', 'question', 'discussion', 'tradition'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'pottery', 'weaving', 'woodwork', 'metalwork', 'jewelry', 
      'textiles', 'embroidery', 'painting', 'sculpture', 'leather-work',
      'bamboo-craft', 'stone-carving', 'glass-work', 'paper-craft',
      'handloom', 'block-printing', 'organic-farming', 'food-processing',
      'general'
    ]
  },
  images: [{
    url: String,
    caption: String
  }],
  videos: [{
    url: String,
    title: String,
    duration: Number
  }],
  tags: [String],
  // For tutorials and techniques
  materials: [String],
  tools: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  steps: [{
    stepNumber: Number,
    title: String,
    description: String,
    image: String,
    tips: [String]
  }],
  // Engagement metrics
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  shares: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    platform: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Language support
  language: {
    type: String,
    enum: ['en', 'hi', 'te', 'bn', 'ta', 'mr', 'gu', 'ur', 'kn', 'ml'],
    default: 'en'
  },
  translations: {
    hi: {
      title: String,
      content: String
    },
    te: {
      title: String,
      content: String
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
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

// Update timestamps
communityPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
communityPostSchema.index({ type: 1, category: 1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);