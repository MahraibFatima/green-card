const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [
    {
      productId: {
        type: String,
        required: true
      },
      product: {
        name: { type: String, required: true },
        image: [String],
        category: String,
        offerPrice: { type: Number, required: true },
        weight: String
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    country: { type: String, required: true }
  },
  paymentType: {
    type: String,
    enum: ['COD', 'Card'],
    default: 'COD'
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
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

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
