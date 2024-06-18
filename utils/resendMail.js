//resend mail

const nodemailer = require('nodemailer');
require('dotenv').config();
const asyncHandler = require('express-async-handler');
const generate4DigitOTP = require('./otpGenarate');
const Otp = require('../Models/otp')



let transporter = nodemailer.createTransport({
      host: process.env.SMHOST,
      port: process.env.SMPORT,
    auth: {
        user: process.env.SEND_EMAIL, 
        pass:process.env.MAIL_PASSWORD,
    }
});

const reSendEmail = asyncHandler(async(req,res)=>{
     console.log("req.session.userData"+req.session.userData)
    console.log(req.session)
    const {email} = req.session.userData
         console.log("email===resend=="+email);
     const reOtp = generate4DigitOTP();

       const resendOTP = new Otp({
        email:email,
        otp :reOtp
       });
        
       resendOTP.save();

    let mailOptions = {
        from: process.env.SMTP_MAIL, 
        to: email, 
        subject: 'OTP  from  OutStack ', 
        html:`<h1>Hi, this is your OTP from Ecommerce-Furniture: <strong>${reOtp}</strong></h1>` 
    };



    // Send email
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

});

module.exports = reSendEmail
