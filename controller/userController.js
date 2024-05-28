
const User = require('../Models/user');
const otpSchema = require('../Models/otp')
const bcrypt = require('bcrypt');
const sendMailer =require('../utils/sendMail');
const generate4DigitOTP =require('../utils/otpGenarate');





//-----------For Rendering Home Page---------------------

const homeLoad =async(req,res)=>{
      try {
          res.render('home');  
      } catch (error) {
            console.log(error.message);
      }
}
//-------------------password Hashing  ----------------------------

const  hashingPassword = async (password)=>{
      try {
            const securePassword = await bcrypt.hash(password,10);
            return securePassword;

      } catch (error) {
            console.log(error.message);
      }
}


//-----------------For Rendered Register Page ----------------

const registerLoad =async (req,res)=>{
      try {
           res.render('register'); 
      } catch (error) {
            console.log(error.message);
      }
}

//------------------inserting the User_-----------------------



const insertUser =async(req,res)=>{
      try {
            const sPassword = await hashingPassword(req.body.password); 
                      const userData = new User ({
                            Fname: req.body.Fname,
                            mobile: req.body.mobile,
                            email: req.body.email,
                            password:sPassword,
                            createdAt: new Date(),
                            is_block:false,
                            is_Admin:false
                       })
                    //console.log("user : "+userData)
               const existingUser = await User.findOne({email:req.body.email});
               if (existingUser) {
                  res.render('register',{message:'This user already existed'});
               }
                  // await userData.save();
               req.session.userData=userData;

            const genaratedOtp = generate4DigitOTP();

            const email = userData.email;
           //console.log(email);
           console.log(genaratedOtp);

            const creatOTP =new otpSchema({
                  email:email,
                  otp:genaratedOtp
            });
             //console.log("complted");
            await creatOTP.save();

            req.session.otp_id=creatOTP._id;

            // console.log("complted");
           await sendMailer(genaratedOtp,email);
      //      console.log("complted");
         
           res.render('OTP');
          
      } catch (error) {
            console.log(error.message);
           
      }
}



//----------------For Rendering OTP Page ------------------------

const otpLoad =async(req,res)=>{
      try {
            res.render('OTP');
      } catch (error) {
           console.log(error.message);
      }
}


//---------------------insert OTP - validating user entered otp and generated otp are same-----------
 

const insertOTP = async(req,res)=>{
      
      try {
          const userData= req.session.userData;
            const email =userData.email;
      //console.log("insetOTP"+email);
      if (!req.body) {
            res.status(400).render('OTP',{email,message:'OTP NOt Found'})
      }
      const otpS = await otpSchema.findById({_id:req.session.otp_id});
       //console.log("OTP shema "+otpS);
      const userOTP = parseFloat(req.body.enteredOTP.join(''));
         const  otp = otpS.otp;

        // console.log("OTP"+otp);

       if (otp===userOTP) {
         //  console.log("USERDATA"+req.session.userData);
         
      const saveUser=await User.create(userData);
     // console.log("SAVE USER"+saveUser)
      if(saveUser){

            res.render('login',{message:"Successfully Registered , You Can Login Now"})
      }

       }else{
           res.render('OTP',{message:'Entere OTP is Wrong try again'});
       }
            
      } catch (error) {
        console.log(error.message);    
      }

   } 



//-------------For Rendered Login Page --------------------

const loginLoad = async (req,res)=>{
      try {
          res.render('login'); 
      } catch (error) {
            console.log(error.message);
      }
}

// ------------verifing that registered user and login user are same  and render to home page--------------------


const validLogin = async(req,res)=>{
      try {

            const email = req.body.email;
            const password =req.body.password;
           // console.log("Login Email="+email);
            const userData = await User.findOne({ email:email});
           // console.log("FindOne Email="+email);
            //console.log("user"+userData);
                
                if(userData){
                  const passwordCheck = await  bcrypt.compare(password,userData.password);  
                 // console.log("checked Password"+userData.password);
                if (passwordCheck) {
                  req.session.user_id =userData;
                  res.redirect('/home');
                }else{
                  res.render('login',{Warning:'Invalide Email and PassWord '});
                }
            }else{
                 res.render('login',{Warning:'Invalide  PassWord try again'});
            }

      } catch (error) {
            console.log(error.message)
      }
}

//---------------------Resend the OTP FOR Veryfication-----------------------


const resendOTP = async(req,res)=>{
      try {
            
            const userData = req.session.userData;
            const email =userData.email
             const resendOtp = generate4DigitOTP();
             console.log("EMAIL===="+email);
             console.log("resendOTP===="+resendOtp);
           const NewOTP =new otp({
            email:email,
            otp:resendOtp
           });
           console.log("NewOTP===="+NewOTP);
           const saveNewOTP = await NewOTP.save();
           await sendMailer(email,saveNewOTP.otp);
             res.render('OTP',{message:"Resend OTP Proceed Successfully"})
      } catch (error) {
            console.log(error.message);
      }
}





module.exports={
      loginLoad,
      homeLoad,
      registerLoad,
      otpLoad,
      insertUser,
      insertOTP,
      validLogin,
      resendOTP
}