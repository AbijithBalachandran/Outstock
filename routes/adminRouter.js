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

// ------------admin signin and customer management ----------------------------------// 


admin_Router.get('/',adminAuth.isLogOut,adminController.signinLoad);
admin_Router.get('/login',adminAuth.isLogOut,adminController.signinLoad);

admin_Router.post('/login',adminController.adminLoad);

admin_Router.get('/dashboard',adminAuth.isLogin,adminController.dashboard);
admin_Router.get('/customerManagement',adminAuth.isLogin,adminController.userLoad);
admin_Router.get('/search-user',adminController.SearchUser);

admin_Router.put('/blockAndUnblockUser',adminController.updateUserStatus);

admin_Router.get('/logOut',adminAuth.isLogin,adminController.logOut);


//--------------catogorymanagement in categoryController ----------------------------//

admin_Router.get('/addcategory',adminAuth.isLogin,categoryController.addCategoryLoad);
admin_Router.post('/addcategory',categoryController.addNewcategory);

admin_Router.get('/categoryManagement',adminAuth.isLogin,categoryController.categoryLoad);
admin_Router.put('/updateCategoyListAndUnlist',categoryController.updateCategoyStatus);

admin_Router.get('/editCategory',adminAuth.isLogin,categoryController.editCategoryLoad);
admin_Router.post('/editCategory',categoryController.editAndUpdateLoad);

// ----------------------------------------productController----------------------------//

admin_Router.get('/productManagement',adminAuth.isLogin,productController.productManagementLoad);
admin_Router.get('/search-product',productController.searchProduct);

admin_Router.get('/addProducts',adminAuth.isLogin,productController.addProductLoad);
admin_Router.post('/addProducts', multer.upload.array('images', 3), productController.addNewproduct);

admin_Router.put('/updateProductListAndUnlist',productController.updateProductStatus);

admin_Router.get('/editProduct',adminAuth.isLogin,productController.editProductLoad);
admin_Router.post('/editProduct', multer.upload.array('images', 3),productController.editAndUpdateProduct);

admin_Router.get('/delete-Product',productController.deleteProduct);


admin_Router.get('*', (req, res) => {
      res.status(404).render('404');
  });



module.exports = admin_Router;