//----------------------Generate a random number between 0 and 9999 for otp------------------------------------
function generate4DigitOTP() {
      
     const randomNumber = Math.floor(1000 + Math.random() * 9000);
     return randomNumber.toString();
 }
 
 module.exports = generate4DigitOTP;