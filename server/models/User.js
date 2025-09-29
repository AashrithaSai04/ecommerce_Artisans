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
    enum: ['customer', 'seller', 'admin'],
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
      country: String
    },
    bio: {
      type: String,
      maxLength: [500, 'Bio cannot be more than 500 characters']
    },
    avatar: String,
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'hi', 'zh'],
      default: 'en'
    }
  },
  sellerInfo: {
    businessName: String,
    businessType: {
      type: String,
      enum: ['farmer', 'artisan', 'producer', 'other']
    },
    description: String,
    specialties: [String],
    verified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
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