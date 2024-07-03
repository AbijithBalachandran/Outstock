
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
const Category = require('../Models/category');
const Order =require('../Models/order');
const { consumers } = require('nodemailer/lib/xoauth2');



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
            res.render('register');
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
            res.render('OTP');
      } catch (error) {
            console.log(error.message);
      }
}


//---------------------insert OTP - validating user entered otp and generated otp are same-----------


const insertOTP = async (req, res) => {

      try {
            const userData = req.session.userData;
            const email = userData.email;
            console.log("insetOTP=" + email);


            if (!req.body) {
                  res.status(400).render('OTP', {message: `${email } OTP NOt Found` })
            }

            const otpS = await otpSchema.findOne( {email:email} ).sort({createdAt:-1});
            //console.log("OTP shema "+otpS);
            const userOTP = parseFloat(req.body.OTP.join(''));

            const otp = otpS.otp;
 
              console.log("OTP from the data base=="+otp);

            if (otp === userOTP) {
                  const saveUser = await User.create(userData);
                  if (saveUser) {
                        const message = encodeURIComponent('Successfully Registared,You Can Login Now');
                        res.redirect(`/login?message=${message}`);
                  }
            } else {
                  res.render('OTP', { email, message: 'Entered OTP is wrong, try again' });
            }


      } catch (error) {
            console.log(error.message);
            return res.status(500).render('OTP', { message: 'An error occurred. Please try again later.' });
      }

}



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
            res.render('login');
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

//-----------------------google Auth------------------

const successGoogleLogin = async (req, res) => {
      try {

            console.log("google"+req.user.email);

            if (req.user.email) {
                  const existingUser = await User.findOne({ email: req.user.email });

                  if (existingUser) {
                        res.redirect('/home');
                  } else {
                        const newUser = await User({
                              name: req.user.displayName,
                              email: req.user.email,
                              is_varified: true
                        })
                        await newUser.save();
                        console.log('newUser=='+newUser);
                        res.redirect('/home');
                  }

            }
      } catch (error) {

            console.log(error.message);
      }
}


const failureGoogleLogin = async (req, res) => {
      console.log("failuer");
      try {
            res.render('login', { message: "Google Authentication Failed" })
      } catch (error) {
            console.log(error.message);
      }
}



//--------------For Rendering Home Page---------------------

const homeLoad = async (req, res) => {
      try {
            let user_id = req.session.userData_id ? req.session.userData_id : " ";

            const product = await Products.find({action:false}).sort({ createdAt: -1 });
            if (req.session.userData_id) {

                  const user = await User.findById({ _id: user_id });
                  res.render('home', { product, user });
            } else {
                  res.render('home', { product });
            }

      } catch (error) {
            console.log(error.message);
      }
}


//------------------------------rendering product details page ----------------------------------------------------//


const productDetails = asyncHandler(async (req, res) => {

      let user_id = req.session.userData_id ? req.session.userData_id : " ";
      let product_Id = req.query.id;

      console.log('productId=====' + product_Id);
      let product = await Products.findById({ _id: product_Id }).populate('category');
      console.log('product=====' + product);

      if (req.session.userData_id) {
            const user = await User.findById({ _id: user_id });
            res.render('product-details', { user, product });
      } else {
            res.render('product-details');
      }
});


//--------------------------logOut-------------------------------------------//

const logOut = asyncHandler(async (req, res) => {
      req.session.destroy();
      res.redirect('home');
});


//--------------------------------Profile page Rendering -------------------------//

const profileLoad = asyncHandler(async(req,res)=>{

      let user_id = req.query.id;
      const user = await User.findById({_id:user_id});
      // console.log("profile"+user);
      res.render('profile',{user});
})

//-----------------------------------------Manage-Address page Load -----------------//

const addressManagemtLoad  = asyncHandler(async(req,res)=>{
      let user_id = req.query.id;
      // console.log('user_id==='+user_id);
      const user = await User.findById(user_id);
      const address= await Address.find({user:user_id});
      const order = await Order.find({})
      res.render('manage-address',{user: user,address});
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
      // console.log("userId=="+userId);
      const user = await User.findById(userId);
      // console.log('user'+user);
      res.render('update-Profile', { user});
});


//-------------------------Update Profile ---------------------------//


const updateProfile = asyncHandler(async (req, res) => {

        const userId = req.query.id;
        const { Fname, Lname, password } = req.body;
        // Find the user by id
        const user = await User.findById(userId);
        // Check if the password matches
        const passwordCheck = await bcrypt.compare(password, user.password);
      //   console.log('password =='+passwordCheck);
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
      

//----------------------------------Shop Page Load -----------------------------------

const shopLoad = asyncHandler(async(req,res)=>{
    const categoryId = req.query.id;
    let query = {action:false};

     if(categoryId){
      query.category = categoryId;
      console.log('categoryId ==='+query.category);
     }

     console.log('categoryId out of scop ==='+query.category);
      let product = await Products.find(query).sort({createdAt:-1});
          
      console.log('product========='+product);

      const category = await Category.find({});
      // console.log('category '+category );
      if(product.length === 0){
          res.render('shop',{product,category,message:'products Not Available'});  
      }

      res.render('shop',{product,category});
});


//-----------------------------------Filter By Category ------------------------------------------

// const filterByCategory = asyncHandler(async (req, res) => {
//       const sort = req.query.name;
//       console.log('sooorttt====' + sort);
//       const category = await Category.find({ name: sort, action: false });
//       const products = await Products.find({category:category._id}).populate('category');

//       console.log('category filter products ==='+products);
//       res.status(200).json({products});
//   });

// const filterByCategory = asyncHandler(async (req, res) => {
//             const sort = req.query.id;
//             console.log('sooorttt====' + sort);
//             // const category = await Category.find({ name: sort, action: false });
//             const products = await Products.findById({category:sort,action:false})
      
//             console.log('category filter products ==='+products);
//             res.status(200).json({products});
//         });
      
// const filterByCategory = asyncHandler(async (req, res) => {
//       const categoryId = req.query.id;
//       console.log('Category ID: ' + categoryId);
  
//       // Fetch products that belong to the category's ID
//       const products = await Products.find({ category: categoryId, action: false }).populate('category');
  
//       if (!products || products.length === 0) {
//           return res.status(404).json({ message: 'No products found in this category' });
//       }
  
//       console.log('Filtered products: ', products);

//       res.status(200).json({ products });
//   });
  
  

//------------------------


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
      profileLoad,
      addressManagemtLoad,
      saveAddress,
      editAddress,
      deleteUser,
      updateProfileLoad,
      updateProfile,
      // filterByCategory
      
}