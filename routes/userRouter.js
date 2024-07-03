//--------------packages------------
const express = require('express');
const user_Router = express();
const passport = require('passport')


//set View Engine
user_Router.set('view engine','ejs');
user_Router.set('views','./views/users');
require('../utils/passport')



//---------------------------middleware ---------------------------------

const userAuth = require('../middleware/userAuth');

//-----------------------------------------------------------------------

const bodyParser =require('body-parser');
user_Router.use(bodyParser.json());
user_Router.use(bodyParser.urlencoded({extended:true}));


user_Router.use(passport.initialize());
user_Router.use(passport.session());

// ----------------controller-------------------
const userController =require('../controller/userController');
const cartController = require('../controller/cartCondrolle');
const orderController = require('../controller/orderCondroller');

//----------------google auth ------------------
user_Router.get('/google',passport.authenticate('google',{scope:['email','profile']}));

// ----------------auth callback----------------

user_Router.get('/google/callback',passport.authenticate('google',{successRedirect:'/success',failureRedirect:'/failure'})); 
user_Router.get('/success',userController.successGoogleLogin);
user_Router.get('/failure',userController.failureGoogleLogin);


//------------------------------------------------------------------------------------

user_Router.get('/register',userAuth.isLogout,userController.registerLoad);
user_Router.post('/register',userController.insertUser);

user_Router.get('/login',userAuth.isLogout,userController.loginLoad);
user_Router.post('/login',userController.validLogin);


user_Router.get('/OTP',userAuth.isLogout,userController.otpLoad);
user_Router.post('/OTP',userController.insertOTP);
user_Router.get('/resendOTP',userAuth.isLogout,userController.resendOTP);

user_Router.get('/home',userController.homeLoad);
user_Router.get('/',userAuth.isLogout,userController.homeLoad);

user_Router.get('/product-details',userAuth.isLogin,userController.productDetails);

//-------------------------user details ---------------------------------------------

user_Router.get('/profile', userAuth.isLogin, (req, res) => {
  req.session.referer = req.headers.referer;
  userController.profileLoad(req, res);
});
user_Router.get('/manage-address',userAuth.isLogin,userController.addressManagemtLoad);
user_Router.post('/manage-address',userController.saveAddress);
user_Router.put('/manage-address',userController.editAddress);
user_Router.delete('/manage-address',userController.deleteUser);

user_Router.get('/update-Profile',userController.updateProfileLoad);
user_Router.put('/update-Profile',userController.updateProfile);
user_Router.get('/shop',userController.shopLoad);
// user_Router.get('/shop-filter', userController.filterByCategory);

//----------------------------cart router --------------------------------------------

user_Router.get('/cart',userAuth.isLogin,cartController.cartLoad);
user_Router.get('/cart-add',cartController.cartProduct);
user_Router.delete('/remove-product',cartController.removeProduct);
user_Router.put('/update-quantity',cartController.updateQuantity);

user_Router.get('/checkout',orderController.checkoutPageLoade);
user_Router.get('/checkout-address',orderController.getAddress);
user_Router.post('/checkout-submit',orderController.checkoutSubmit)

user_Router.get('/orders',orderController.myOrederLoad);
user_Router.get('/wishlist',orderController.whishlistLoad);




user_Router.get('/logOut',userController.logOut);


user_Router.get('*', (req, res) => {
      res.status(404).render('404');
  });

module.exports = user_Router;