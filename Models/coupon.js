const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
    unique: true
  },
  couponStatus: {
    type: Boolean,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  miniParchaseAmt: {
    type: Number,
    required: true
  },
  maxredeemableAmt: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expDate: {
    type: Date,
    required: true
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;