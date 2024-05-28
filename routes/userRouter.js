
const express = require('express');
const user_Router = express();

user_Router.set('view engine','ejs');
user_Router.set('views','./views/users');


const bodyParser =require('body-parser');
user_Router.use(bodyParser.json());
user_Router.use(bodyParser.urlencoded({extended:true}));


const userController =require('../controller/userController');



user_Router.get('/home',userController.homeLoad)
user_Router.get('/',userController.homeLoad)

user_Router.get('/login',userController.loginLoad);
user_Router.post('/login',userController.validLogin);

user_Router.get('/register',userController.registerLoad);
user_Router.post('/register',userController.insertUser);

user_Router.get('/OTP',userController.otpLoad);
user_Router.post('/OTP',userController.insertOTP);
user_Router.get('/resendOTP',userController.resendOTP)


module.exports = user_Router;