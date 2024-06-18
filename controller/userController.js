
const User = require('../Models/user');
const otpSchema = require('../Models/otp')
const bcrypt = require('bcrypt');
const sendMailer = require('../utils/sendMail');
const reSendEmail = require('../utils/resendMail');
const generate4DigitOTP = require('../utils/otpGenarate');
const Products = require('../Models/products');
const asyncHandler = require('express-async-handler');






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
            console.log('this is here in login page');
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

            // console.log("Login Email="+email);
            // console.log("Password"+password);
            const userData = await User.findOne({ email: email,is_block:false});
            // console.log("FindOne Email="+email);
            //console.log("user"+userData);
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

            //console.log("google"+req.user.email);

            if (req.user) {
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
           // console.log(req.session.userData_id, req.session.userId)

            const product = await Products.find({}).sort({ createdAt: -1 });
            //console.log("product ======="+product);
            if (req.session.userData_id) {

                  const user = await User.findById({ _id: user_id });
                  // console.log("asdfghj====");
                  res.render('home', { product, user });
            } else {
                  //console.log("asdfghjwertyfdsadfgh====");
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
      let product = await Products.findById({ _id: product_Id });
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
      console.log("profile"+user);
      res.render('profile',{user});
})

//-----------------------------------------Manage-Product page Load -----------------//








module.exports = {
      loginLoad,
      homeLoad,
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
      profileLoad
}