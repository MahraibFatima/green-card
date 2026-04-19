const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: [String], default: [] },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: [String], default: [] },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;