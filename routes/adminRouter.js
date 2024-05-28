const express = require('express');
const admin_Router = express();

admin_Router.set('view engine','ejs');
admin_Router.set('views','./views/admin');

const asyncHandler = require('express-async-handler');
const bodyParser =require('body-parser');
admin_Router.use(bodyParser.json());
admin_Router.use(bodyParser.urlencoded({extended:true}));


const adminAuth = require('../middleware/auth');


const adminController = require('../controller/adminController');
const categoryController =require('../controller/categoryController');

// ------------admin signin and customer management ----------------------------------// 


admin_Router.get('/admin',adminAuth.isLogOut,adminController.signinLoad);
admin_Router.get('/login',adminAuth.isLogOut,adminController.signinLoad);

admin_Router.post('/login',adminController.adminLoad);

admin_Router.get('/dashboard',adminAuth.isLogin,adminController.dashboard);
admin_Router.get('/customerManagement',adminAuth.isLogin,adminController.userLoad);

admin_Router.put('/blockAndUnblockUser',adminController.updateUserStatus);

admin_Router.get('/logOut',adminAuth.isLogin,adminController.logOut);

//--------------catogorymanagement in categoryController ----------------------------//

admin_Router.get('/addcategory',adminAuth.isLogin,categoryController.addCategoryLoad);
admin_Router.post('/addcategory',categoryController.addNewcategory);

admin_Router.get('/categoryManagement',adminAuth.isLogin,categoryController.categoryLoad);
admin_Router.put('/updateCategoyListAndUnlist',categoryController.updateCategoyStatus);

admin_Router.get('/editCategory',adminAuth.isLogin,categoryController.editCategoryLoad);
admin_Router.post('/editCategory',categoryController.editAndUpadateLoad);



module.exports = admin_Router;