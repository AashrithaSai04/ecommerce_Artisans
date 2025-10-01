const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    maxLength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minLength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'artisan', 'admin'],
    default: 'customer'
  },
  profile: {
    phone: {
      type: String,
      maxLength: [20, 'Phone number cannot be more than 20 characters']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    bio: {
      type: String,
      maxLength: [1000, 'Bio cannot be more than 1000 characters']
    },
    avatar: String,
    language: {
      type: String,
      enum: ['en', 'hi', 'te', 'bn', 'ta', 'mr', 'gu', 'ur', 'kn', 'ml'],
      default: 'en'
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    }
  },
  // Enhanced Artisan/Seller Information
  artisanInfo: {
    shopName: String,
    craftSpecialties: [{
      type: String,
      enum: [
        'pottery', 'weaving', 'woodwork', 'metalwork', 'jewelry', 
        'textiles', 'embroidery', 'painting', 'sculpture', 'leather-work',
        'bamboo-craft', 'stone-carving', 'glass-work', 'paper-craft',
        'handloom', 'block-printing', 'organic-farming', 'food-processing'
      ]
    }],
    story: {
      type: String,
      maxLength: [2000, 'Story cannot be more than 2000 characters']
    },
    experience: {
      years: {
        type: Number,
        min: 0
      },
      description: String
    },
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      document: String // URL to certificate document
    }],
    workshopImages: [String],
    awards: [{
      title: String,
      year: Number,
      description: String
    }],
    techniques: [String],
    materials: [String],
    verified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [{
      type: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    // Payment Information
    paymentInfo: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      upiId: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    // Business Settings
    businessSettings: {
      acceptCustomOrders: {
        type: Boolean,
        default: true
      },
      minimumOrderValue: {
        type: Number,
        default: 0
      },
      processingTime: {
        type: String,
        default: '3-5 days'
      },
      shippingPolicy: String,
      returnPolicy: String,
      workingHours: {
        start: String,
        end: String,
        workingDays: [String]
      }
    }
  },
  // Customer-specific information
  customerInfo: {
    wishlist: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    }],
    preferences: {
      categories: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      preferredArtisans: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }]
    },
    deliveryAddresses: [{
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);