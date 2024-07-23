const express = require('express');
const admin_Router = express();

admin_Router.set('view engine','ejs');
admin_Router.set('views','./views/admin');

const multer = require('../config/mutler');

const asyncHandler = require('express-async-handler');
const bodyParser =require('body-parser');
admin_Router.use(bodyParser.json());
admin_Router.use(bodyParser.urlencoded({extended:true}));


const adminAuth = require('../middleware/auth');

//-------------------require controllers---------------------------------------------------//
const adminController = require('../controller/adminController');
const categoryController =require('../controller/categoryController');
const productController =require('../controller/productController');
const couponController = require('../controller/couponController');
const offerController = require('../controller/offerController');

// ------------admin signin and customer management ----------------------------------// 


admin_Router.get('/',adminAuth.isLogOut,adminController.signinLoad);
admin_Router.get('/login',adminAuth.isLogOut,adminController.signinLoad);

admin_Router.post('/login',adminController.adminLoad);

admin_Router.get('/dashboard',adminAuth.isLogin,adminController.dashboard);
admin_Router.get('/customerManagement',adminAuth.isLogin,adminController.userLoad);
admin_Router.get('/search-user',adminController.SearchUser);

admin_Router.put('/blockAndUnblockUser',adminController.updateUserStatus);

admin_Router.get('/logOut',adminAuth.isLogin,adminController.logOut);


admin_Router.get('/orderManagement',adminAuth.isLogin,adminController.orderPageLoad);
admin_Router.get('/order-detail',adminAuth.isLogin,adminController.OrderDetailPage);
admin_Router.put('/update-status/:orderId/:newStatus', adminController.updateOrderStatus);

admin_Router.post('/aprove-return',adminController.aproveToReturn);

admin_Router.get('/salesReport',adminAuth.isLogin,adminController.salesReportPage);
admin_Router.post('/filterSalesReport',adminController.filterSalesReport);
admin_Router.get('/coustomSalesReport',adminController.filterSalesReport);


//--------------catogorymanagement in categoryController ----------------------------//

admin_Router.get('/addcategory',adminAuth.isLogin,categoryController.addCategoryLoad);
admin_Router.post('/addcategory',categoryController.addNewCategory);

admin_Router.get('/categoryManagement',adminAuth.isLogin,categoryController.categoryLoad);
admin_Router.put('/updateCategoyListAndUnlist',categoryController.updateCategoyStatus);

admin_Router.get('/editCategory',adminAuth.isLogin,categoryController.editCategoryLoad);
admin_Router.put('/editCategory',categoryController.editAndUpdateLoad);

// ----------------------------------------productController----------------------------//

admin_Router.get('/productManagement',adminAuth.isLogin,productController.productManagementLoad);
admin_Router.get('/search-product',productController.searchProduct);

admin_Router.get('/addProducts',adminAuth.isLogin,productController.addProductLoad);
admin_Router.post('/addProducts', multer.upload.array('images', 3), productController.addNewproduct);

admin_Router.put('/updateProductListAndUnlist',productController.updateProductStatus);

admin_Router.get('/editProduct',adminAuth.isLogin,productController.editProductLoad);
admin_Router.post('/editProduct', multer.upload.array('images', 3),productController.editAndUpdateProduct);

admin_Router.get('/delete-Product',productController.deleteProduct);

//-----------------------------------------Coupon Controller --------------------------------

admin_Router.get('/couponManagement',adminAuth.isLogin,couponController.couponManagementLoad);
admin_Router.get('/addcoupon',adminAuth.isLogin,couponController.addCouponPage);
admin_Router.post('/addcoupon',couponController.addNewCoupon);

admin_Router.get('/editcoupon',adminAuth.isLogin,couponController.editCouponPage);
admin_Router.put('/editcoupon',couponController.editCoupons);

admin_Router.put('/updateCouponListAndUnlist',couponController.updateCouponStatus);
admin_Router.get('/delete-coupon',couponController.deleteCoupon);


//----------------------------------------OFFER cONTROLLER ----------------------------------------------

admin_Router.get('/offerManagement',adminAuth.isLogin,offerController.offerManagement);

admin_Router.get('/addOffer',adminAuth.isLogin,offerController.addNewOfferPage);
// admin_Router.post('/addOffer',offerController.addOffer);

admin_Router.get('/editOffer',adminAuth.isLogin,offerController.editOfferPage);
admin_Router.put('/editOffer',offerController.editOffer);

admin_Router.put('/updateofferActivateAndDeActivate',offerController.OfferActiveandDeactivate);
admin_Router.post('/apply-Offer',offerController.applyOffer);
//----------------------------------------------------------------------------------------------------------

admin_Router.get('*', (req, res) => {
      res.status(404).render('404',{ ActivePage: '404' });
  });



module.exports = admin_Router;