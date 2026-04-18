const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Processing', 'Refunded', 'Rejected'],
      default: 'Processing',
    },
    paymentType: {
      type: String,
      enum: ['COD', 'Card'],
      default: 'COD',
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Refund', refundSchema);