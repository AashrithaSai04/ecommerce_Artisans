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
      enum: ['upi', 'bank_transfer', 'credit_card', 'debit_card', 'digital_wallet', 'cash_on_delivery']
    },
    transactionId: String,
    upiId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    paymentGateway: String,
    paidAt: Date
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
    enum: [
      'pending',
      'confirmed', 
      'artisan-accepted',
      'in-production',
      'ready-to-ship',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'refunded',
      'return-requested',
      'return-approved',
      'returned'
    ],
    default: 'pending'
  },
  
  // Enhanced tracking for artisan marketplace
  artisanResponse: {
    accepted: Boolean,
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    estimatedCompletionDate: Date,
    notes: String
  },
  
  // Production tracking for handmade items
  productionInfo: {
    startedAt: Date,
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    progressUpdates: [{
      stage: String,
      description: String,
      images: [String],
      completedAt: Date
    }]
  },
  
  trackingInfo: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryAttempts: [{
      attemptDate: Date,
      status: String,
      note: String
    }]
  },
  
  // Return/Refund information
  returnInfo: {
    requested: Boolean,
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'picked-up', 'received', 'refunded']
    },
    refundAmount: Number,
    refundedAt: Date,
    pickupScheduled: Date
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