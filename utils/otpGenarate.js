
// const otpGenerator =require('otp-generator');

// //-----------------genarating OTP-----------------------------

// const generatorOTP = ()=>{
//       const otp = otpGenerator.generate(4,
//                  {digits:true,
//                  upperCaseAlphabets:false,
//                 specialChars:false});
//            return otp;
//       }

//  module.exports = generatorOTP();

//----------------------Generate a random number between 0 and 9999 for otp------------------------------------
function generate4DigitOTP() {
      
     const randomNumber = Math.floor(1000 + Math.random() * 9000);
     return randomNumber.toString();
 }
 
 module.exports = generate4DigitOTP;