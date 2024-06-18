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
      default:Date.now(),
      expires: 120
     }
})

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;

