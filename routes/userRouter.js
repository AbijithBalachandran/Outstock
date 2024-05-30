//--------------packages------------
const express = require('express');
const user_Router = express();
const passport = require('passport')


//set View Engine
user_Router.set('view engine','ejs');
user_Router.set('views','./views/users');
require('../utils/passport')


const bodyParser =require('body-parser');
user_Router.use(bodyParser.json());
user_Router.use(bodyParser.urlencoded({extended:true}));


user_Router.use(passport.initialize());
user_Router.use(passport.session());

// ----------------controller-------------------
const userController =require('../controller/userController');

user_Router.get('/home',userController.homeLoad)
user_Router.get('/',userController.homeLoad)

user_Router.get('/login',userController.loginLoad);
user_Router.post('/login',userController.validLogin);


//----------------google auth ------------------
user_Router.get('/google',passport.authenticate('google',{scope:['email','profile']}));

// ----------------auth callback----------------

user_Router.get('/google/callback',passport.authenticate('google',{successRedirect:'/success',failureRedirect:'/failure'})); 
user_Router.get('/success',userController.successGoogleLogin);
user_Router.get('/failure',userController.failureGoogleLogin);

//-------------------------------------------------------------------


user_Router.get('/register',userController.registerLoad);
user_Router.post('/register',userController.insertUser);

user_Router.get('/OTP',userController.otpLoad);
user_Router.post('/OTP',userController.insertOTP);
user_Router.get('/resendOTP',userController.resendOTP)


module.exports = user_Router;