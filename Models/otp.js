const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
     email:{
      type:String,
      require:true
     },
     otp:{
      type:Number,
      require:true
     },
     createdAt:{
      type:Date,
      default:Date.now()
     }
})

// Automatically expire documents after 120 seconds (2 minutes)
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;

