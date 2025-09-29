const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    phone: String
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  orderSummary: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingInfo: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  orderHistory: [{
    status: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `RM${timestamp.slice(-6)}${random}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Add order history entry when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.orderHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);