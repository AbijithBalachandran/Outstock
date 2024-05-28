
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMail = async (otp,email) => {
    try {
        const transport = nodemailer.createTransport({
            host: process.env.SMHOST,
            port: process.env.SMPORT,
            secure: true, 
            auth: {
                user: process.env.SEND_EMAIL,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SEND_EMAIL,
            to: email,
            subject: 'OTP For Email Verification',
            html: `<h1>Hi, this is your OTP from Ecommerce-Furniture: <strong>${otp}</strong></h1>`,
        };

        const info = await transport.sendMail(mailOptions);
       // console.log('Email sent successfully:', info.response);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        
        

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = sendMail;
