const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: Number, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
}, { timestamps: true });

const paymentMethodSchema = new mongoose.Schema({
    cardType: { type: String, required: true }, // Visa, Mastercard, etc.
    cardHolderName: { type: String, required: true },
    cardNumber: { type: String, required: true }, // Store last 4 digits only
    expiryMonth: { type: String, required: true },
    expiryYear: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isVerified: {type: Boolean, default: false},
    verificationToken: {type: String},
    verificationTokenExpires: {type: Date},
    role: {type: String, enum: ['user', 'seller'], default: 'user'},
    shopName: {type: String},
    shopDescription: {type: String},
    shopPhone: {type: String},
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    cartItems: [cartItemSchema],
    },
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);