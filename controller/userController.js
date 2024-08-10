
const User = require('../Models/user');
const otpSchema = require('../Models/otp')
const bcrypt = require('bcrypt');
const sendMailer = require('../utils/sendMail');
const reSendEmail = require('../utils/resendMail');
const generate4DigitOTP = require('../utils/otpGenarate');
const Products = require('../Models/products');
const asyncHandler = require('express-async-handler');
const Address = require('../Models/address');
const { session } = require('passport');
require('../utils/passport')
const Category = require('../Models/category');
const Order =require('../Models/order');
const Cart = require('../Models/cart')
const { consumers } = require('nodemailer/lib/xoauth2');
const Offer = require('../Models/offer');


//-----------------------------------password Hashing -----------------------------------------

const hashingPassword = async (password) => {
      try {
            const securePassword = await bcrypt.hash(password, 10);
            return securePassword;

      } catch (error) {
            console.log(error.message);
      }
}


//-----------------For Rendered Register Page ----------------

const registerLoad = async (req, res) => {
      try {
            res.render('register',{activePage:"register"});
      } catch (error) {
            console.log(error.message);
      }
}

//------------------inserting the User_-----------------------



const insertUser = async (req, res) => {
      try {
            const sPassword = await hashingPassword(req.body.password);
            const userData = new User({
                  Fname: req.body.Fname,
                  Lname: req.body.Lname,
                  mobile: req.body.mobile,
                  email: req.body.email,
                  password: sPassword,
                  createdAt: new Date(),
                  is_block: false,
                  is_Admin: false
            })
            //console.log("user : "+userData)
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                  res.render('register', { message: 'This user already existed' });
            }
            req.session.userData = userData;

            const genaratedOtp = generate4DigitOTP();

            const email = userData.email;
            //console.log(email);
            console.log("genarating otp in insert otp=="+genaratedOtp);

            const creatOTP = new otpSchema({
                  email: email,
                  otp: genaratedOtp
            });
            //console.log("complted");
          const saveOTP = await creatOTP.save();

          if (!saveOTP) {
            throw new Error('Failed to save OTP');
        }
            // req.session.otp_id = saveOTP._id;

            // console.log("complted");
            await sendMailer(genaratedOtp, email);
            //      console.log("complted");
            req.session.userData_id = userData._id;
            res.redirect('/OTP');

      } catch (error) {
            console.error(`Error during user registration: ${error.message}`);
            res.status(500).render('register', { message: 'An error occurred during registration. Please try again.' });

      }
}


//------------------------For Rendering OTP Page ---------------------------

const otpLoad = async (req, res) => {
      try {
            res.render('OTP',{activePage:"OTP"});
      } catch (error) {
            console.log(error.message);
      }
}


//---------------------insert OTP - validating user entered otp and generated otp are same-----------

const insertOTP = async (req, res) => {
      try {
          const userData = req.session.userData;
          const email = userData.email;
          console.log("insertOTP=" + email);
  
          if (!req.body || !req.body.OTP) {
              return res.status(400).render('OTP', { message: `${email} OTP Not Found` });
          }
  
          const otpS = await otpSchema.findOne({ email: email }).sort({ createdAt: -1 });
          if (!otpS) {
              return res.status(400).render('OTP', { email, message: 'OTP not found for this email.' });
          }
  
          const userOTP = parseInt(req.body.OTP.join(''), 10);
          const otp = otpS.otp;
  
          console.log("OTP from the database=" + otp);
  
          if (otp === userOTP) {
              const saveUser = await User.create(userData);
              if (saveUser) {
                  const message = encodeURIComponent('Successfully Registered, You Can Login Now');
                  return res.redirect(`/login?message=${message}`);
              } else {
                  return res.status(500).render('OTP', { email, message: 'User registration failed, please try again.' });
              }
          } else {
              return res.render('OTP', { email, message: 'Entered OTP is wrong, try again' });
          }
      } catch (error) {
          console.log(error.message);
          return res.status(500).render('OTP', { message: 'An error occurred. Please try again later.' });
      }
  };
  
  

//---------------------Resend the OTP FOR Veryfication-----------------------

const resendOTP = async(req,res)=>{
      try {
          await reSendEmail(req,res)
  
      } catch (error) {
          console.log(error.message);
      }
  }


//-------------For Rendered Login Page --------------------------------------------------

const loginLoad = async (req, res) => {
      try {
            res.render('login',{activePage:"login"});
      } catch (error) {
            console.log(error.message);
      }
}


// ------------verifing that registered user and login user are same  and render to home page--------------------


const validLogin = async (req, res) => {
      try {

            const email = req.body.email;
            const password = req.body.password;

            const userData = await User.findOne({ email: email,is_block:false});
            if (userData) {
                  const passwordCheck = await bcrypt.compare(password, userData.password);
                  console.log("checked Password" + userData.password);
                  console.log(passwordCheck);
                  if (passwordCheck) {
                        req.session.user_id = userData;
                        req.session.userData_id = userData.id;
                        res.redirect('/home');
                  } else {
                        res.render('login', { Warning: 'Invalide Email and PassWord ' });
                  }
            } else {
                  res.render('login', { Warning:'user is blocked'});
            }


      } catch (error) {
            console.log(error.message)
      }
}

//--------------------------google Auth-------------------------------

const successGoogleLogin = async (req, res) => {
    try {
      console.log('req.user:=====', req.user);
      if (req.user) {
        const existingUser = await User.findOne({ email: req.user.email });
  
        if (existingUser) {
          req.session.userData_id = existingUser._id;
          res.redirect('/');
        } else {
          const newUser = new User({
            Fname: req.user.given_name,
            Lname:req.user.family_name,
            email: req.user.email,
            is_varified: true
          });
  
          req.session.userData_id = newUser._id;
          console.log('new User google authentication:', newUser);
          await newUser.save();
  
          res.redirect('/home');
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const failureGoogleLogin = async (req, res) => {
    console.log("failure");
    try {
      res.render('login', { message: "Google Authentication Failed" });
    } catch (error) {
      console.log(error.message);
    }
  };
  

//--------------For Rendering Home Page---------------------

const homeLoad = async (req, res) => {
      try {


            const FirstPage = 4;
            const currentPage = parseInt(req.query.page) || 1;

            const start = (currentPage - 1) * FirstPage;

            const  productData = await Products.find({}).populate('category').skip(start).limit(FirstPage);
            const products = await Products.countDocuments({});

            const totalPages = Math.ceil(products / FirstPage);


          let user_id = req.session.userData_id ? req.session.userData_id : " ";
  
          const product = await Products.find({ action: false }).sort({ createdAt: -1 }).populate('offer');
          let cartCount = 0;

          if (req.session.userData_id) {
              const user = await User.findById({ _id: user_id });
              const cart = await Cart.findOne({ user: user_id });
  
              if (cart) {
                  cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
              }

                 const calculateDiscount = async (product) => {

                  let offerDetails = null;
      
                  if (product && product.offer && product.offer.length > 0) {
                      const offerId = product.offer[product.offer.length - 1];
                      console.log('offerId=====' + offerId);
      
                      offerDetails = await Offer.find(offerId);
                      console.log('offerDetails' + offerDetails);
      
                  }
      
                  return { offerDetails };
              };
      
              const {offerDetails } = await calculateDiscount(product[0]);
      
              console.log('offerDetails 22222' + offerDetails);

              res.render('home', { product: productData, currentPage, totalPages, user, cartCount ,offerDetails,activePage:"home"});

          } else {
            
            const calculateDiscount = async (product) => {
                  
                  let offerDetails = null;
      
                  if (product && product.offer && product.offer.length > 0) {
                      const offerId = product.offer[product.offer.length - 1];
                      console.log('offerId=====' + offerId);
      
                      offerDetails = await Offer.find();
                      console.log('offerDetails' + offerDetails);
                  }
      
                  return {offerDetails };
              };
      
              const {offerDetails } = await calculateDiscount(product[0]);
      
            //   console.log('offerDetails========' + offerDetails);
           
              res.render('home', { product: productData, currentPage, totalPages, cartCount,offerDetails,activePage:"home" });

          }
      
      } catch (error) {
          console.log(error.message);
      }
  }
  

//------------------------------rendering product details page ----------------------------------------------------//


const productDetails = asyncHandler(async (req, res) => {
      let user_id = req.session.userData_id ? req.session.userData_id : " ";
      let product_Id = req.query.id;
  
      // Fetch the product by its ID and populate the 'category' field
      let product = await Products.findById({ _id: product_Id }).populate('category');
  
      let disPrice = null;
      let offerDetails =null;

      if (product && product.offer && product.offer.length > 0) {
          let offerLength = product.offer.length - 1;
         const offerId = product.offer[offerLength];
          console.log('offerId=====' + offerId);
  
           offerDetails = await Offer.findById( offerId);
          console.log('offerDetails'+offerDetails);

          if (offerDetails) {
              let disAmount = product.price * (offerDetails.discount / 100);
              disPrice = product.price - disAmount;
          }
      }
console.log('offerDetails 22222'+offerDetails);
      console.log('disPrice'+disPrice);
  
      if (req.session.userData_id) {
          const user = await User.findById({ _id: user_id });
          const cart = await Cart.findOne({ user: user_id });
          let cartCount = 0;
          if (cart) {
              cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
          }
          res.render('product-details', { user, product, cartCount, disPrice ,offerDetails,activePage:"home"});
      } else {
          res.render('product-details', { product, disPrice,offerDetails,activePage:"home"  });
      }
  });



//--------------------------logOut-------------------------------------------//

const logOut = asyncHandler(async (req, res) => {
      req.session.destroy();
      res.redirect('home');
});


//------------------------------About page rendering ---------------------------//

const aboutPage = asyncHandler(async(req,res)=>{
      res.render('about',{activePage:"about"})
})

//-------------------------------contact page rendering ---------------------------//

const contactPage = asyncHandler(async(req,res)=>{
      res.render('contact',{activePage:"contact"});
})
//--------------------------------Profile page Rendering -------------------------//

const profileLoad = asyncHandler(async(req,res)=>{

      let user_id = req.query.id;
      const user = await User.findById({_id:user_id});
      const cart = await Cart.findOne({ user: user_id });
      let cartCount = 0;
      if (cart) {
          cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
      }
      // console.log("profile"+user);
      res.render('profile',{user,cartCount,activePage:"profile"});
})

//-----------------------------------------Manage-Address page Load -----------------//

const addressManagemtLoad  = asyncHandler(async(req,res)=>{
      let user_id = req.query.id;

      const user = await User.findById(user_id);
      const address= await Address.find({user:user_id});
      
      const cart = await Cart.findOne({ user: user_id });
      let cartCount = 0;
      if (cart) {
          cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
      }

      res.render('manage-address',{user: user,address,cartCount,activePage:"manage-address"});
});

//--------------------------------------Adding User Address ----------------------------//

const saveAddress = asyncHandler(async(req,res)=>{
    
      const userId = req.session.userData_id;
      // console.log('UserId=='+userId);
      const user =await User.findById(userId);
      // console.log("user"+user);
      // console.log("email"+user.email);
      const {address,name,phone,location,landmark,pincode,city}=req.body;

      const userAddress = new Address ({
         user:userId,
         name:name,
         address:address,
         phone:phone,
         location:location,
         landmark:landmark,
         pincode:pincode,
         city:city,
         email:user.email,
         createdAt:new Date()
      });

    await userAddress.save();
 
     res.sendStatus(200);
       
})

//--------------------------------Edit-Address----------------------------------//

const editAddress = asyncHandler(async(req,res)=>{
       const userId = req.session.userData_id;
       const {address,name,phone,location,landmark,pincode,city}=req.body;
    await Address.findByIdAndUpdate(
       req.body.id,
      {
            $set:{
                  user:userId,
                  name:name,
                  address:address,
                  phone:phone,
                  location:location,
                  landmark:landmark,
                  pincode:pincode,
                  city:city
            }

      });

     res.sendStatus(200);
});


// --------------------Delete The User Address ----------------------//

const deleteUser = asyncHandler(async(req,res)=>{
      const id = req.query.id;
      await Address.deleteOne({_id:id});
      res.sendStatus(200);
});

//-----------------------Update Profile -------------------------------//

const updateProfileLoad = asyncHandler(async(req,res)=>{

      let userId = req.query.id;
      const cart = await Cart.findOne({ user: userId });
      let cartCount = 0;
      if (cart) {
          cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
      }

      const user = await User.findById(userId);
      // console.log('user'+user);
      res.render('update-Profile', { user,cartCount,activePage:"update-Profile"});
});


//-------------------------Update Profile ---------------------------//


const updateProfile = asyncHandler(async (req, res) => {

        const userId = req.query.id;
        const { email,Fname, Lname, password } = req.body;
        console.log(req.body.email);
        const user = await User.findOne({email:email});

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (passwordCheck) {
          await User.findByIdAndUpdate(
            userId,
            {
              $set: {
                Fname: Fname,
                Lname: Lname,
              }
            },{new:true});
            
          res.sendStatus(200);
        } else {
          res.status(401).send({ error: 'Incorrect password' });
        }

      });

//----------------------------------Shop Page Load && filter by  -----------------------------------

const getBestSellingProducts = async (limit = 5) => {
      try {
          const bestSellingProducts = await Order.aggregate([
              { $unwind: "$orderItem" },
              {
                  $group: {
                      _id: "$orderItem.productId",
                      totalSold: { $sum: "$orderItem.quantity" },
                      productName: { $first: "$orderItem.productName" },
                      price: { $first: "$orderItem.price" },
                      images: { $first: "$orderItem.images" },
                      category: { $first: "$orderItem.category" },
                  }
              },
              { $sort: { totalSold: -1 } },
              { $limit: limit },
              {
                  $lookup: {
                      from: 'products',
                      localField: '_id',
                      foreignField: '_id',
                      as: 'productDetails'
                  }
              },
              { $unwind: "$productDetails" },
              {
                  $project: {
                      _id: 1,
                      totalSold: 1,
                      productName: 1,
                      price: 1,
                      images: 1,
                      category: 1,
                      productDetails: 1
                  }
              }
          ]);
  
          return bestSellingProducts;
      } catch (error) {
          console.error("Error fetching best-selling products:", error);
          throw error;
      }
  };



const shopLoad = asyncHandler(async (req, res) => {

      const FirstPage = 8;
      const currentPage = parseInt(req.query.page) || 1;

      const start = (currentPage - 1) * FirstPage;

      const  productData = await Products.find({}).populate('category').skip(start).limit(FirstPage);
      const products = await Products.countDocuments({});

      const totalPages = Math.ceil(products / FirstPage);



      let user_id = req.session.userData_id;

      // Validate user_id before making a database query
      let user = null;
      if (user_id) {
          try {
              user = await User.findOne({ _id: user_id });
          } catch (error) {
              console.error('Error fetching user:', error);
              return res.status(500).send('Internal Server Error');
          }
      }
  
      const categoryId = req.query.id;
      const sortBy = req.query.sort_by;
  
      let query = { action: false };
  
      if (categoryId) {
          query.category = categoryId;
          console.log('categoryId ===' + query.category);
      }
  
      let sortCriteria = {};
      switch (sortBy) {
          case 'title-ascending':
              sortCriteria.title = 1;
              break;
          case 'title-descending':
              sortCriteria.title = -1;
              break;
          case 'price-ascending':
              sortCriteria.price = 1;
              break;
          case 'price-descending':
              sortCriteria.price = -1;
              break;
          case 'created-ascending':
              sortCriteria.createdAt = 1;
              break;
          case 'created-descending':
              sortCriteria.createdAt = -1;
              break;
          default:
              sortCriteria.createdAt = -1;
      }
  
      try {
            const category = await Category.find({});
            console.log('category======='+category);
          const product = await Products.find(query).sort(sortCriteria).populate('offer').populate('category').skip(start).limit(FirstPage);
          
          product.forEach(product => {
            if (product.offer.length > 0) {
                const offer = product.offer[0];
                if (offer && offer.discount) {
                    product.discountPercentage = offer.discount;
                    product.discountPrice = product.price - (product.price * (offer.discount / 100));
                }
            }
        });
        
          if (product.length === 0) {
              return res.render('shop', { currentPage, totalPages,product, category, user, message: 'Products Not Available',activePage:'shop' });
          }
          
          let cartCount = 0;
          if (user) {
              const cart = await Cart.findOne({ user: user_id });
              if (cart) {
                  cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
              }
          }

          const bestSellingProducts = await getBestSellingProducts();
  
          res.render('shop', {bestSellingProducts,currentPage, totalPages, product, category, user, cartCount,activePage:'shop' });
  
      } catch (error) {
          console.error('Error fetching products:', error);
          res.status(500).send('Internal Server Error');
      }
  });


//------------------------------Search Products ------------------------------

const searchProduct = asyncHandler(async (req, res) => {
      
      let product = [];
      const currentPage = parseInt(req.query.page);
      const FirstPage = 8;
      const start = (currentPage - 1) * FirstPage;
      const totalproduct = await Products.countDocuments({ action:false });
      const totalPages = Math.ceil(totalproduct / FirstPage);

      const productData = {
            $or:[{name: { $regex: req.query.search, $options: 'i'}}]}
      
            console.log('search quary '+req.query.search);
        const category = await Category.find({});
        
       if(req.query.search){
             product = await Products.find(productData).skip(start).limit(FirstPage)
       }else{
             product =await Products.find().skip(start).limit(FirstPage);
       }

       const bestSellingProducts = await getBestSellingProducts();

      res.render('shop', {product,currentPage,totalPages,category,bestSellingProducts,activePage:"shop"});

  });
  

//-----------------------------------------------------------------------------------------------

module.exports = {
      loginLoad,
      homeLoad,
      shopLoad,
      registerLoad,
      otpLoad,
      insertUser,
      insertOTP,
      validLogin,
      resendOTP,
      successGoogleLogin,
      failureGoogleLogin,
      productDetails,
      logOut,
      aboutPage,
      contactPage,
      profileLoad,
      addressManagemtLoad,
      saveAddress,
      editAddress,
      deleteUser,
      updateProfileLoad,
      updateProfile,
      searchProduct
      
}