const User = require('../Models/user');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');


//--------------------------------------------------

//----------------singup page rendering --------------
const signinLoad = async (req, res) => {
      try {
            res.render('login');
      } catch (error) {
            console.log(error.message);
      }
}

//---------------------Admin Signup -------enter details-------------

const adminLoad = async (req, res) => {
      try {
            email = req.body.email,
            password = req.body.password
            const adminData = await User.findOne({ email: email });
            console.log('adminData' + adminData);
            if (adminData) {
                  const passwordCheck = await bcrypt.compare(password, adminData.password)

                  if (passwordCheck) {
                        if (adminData.is_Admin === false) {
                              res.render('login', { message: 'Invalid email and password' });
                        } else {
                              req.session.admin_id = adminData._id;
                              res.render('dashboard');
                        }
                  } else {
                        res.render('login', { message: 'Invalid email and password' });
                  }

            } else {
                  res.render('login', { message: 'Invalid email and password' });
            }

      } catch (error) {
            console.log(error.message);
      }
}


//-------------------dashboard loading---------------

const dashboard = async (req, res) => {
      try {
            res.render('dashboard');
      } catch (error) {
            console.log(error.message);
      }
}

//--------------------rendering User details --------------

const userLoad = async (req, res) => {
      try {
            const FirstPage = 10;
            const currentPage = parseInt(req.query.page);

            const start =(FirstPage - 1) * currentPage;

            const userData = await User.find({ is_Admin: false }).skip(start).limit(FirstPage);
            const user = await User.countDocuments();
            const totalPages = Math.ceil(user / currentPage);

          
            res.render('customerManagement', {users:userData , currentPage,totalPages });
      } catch (error) {
            console.log(error.message);
      }
}

//-----------------Admin Bock And Unblock User--------------- 

const updateUserStatus = async (req, res) => {
      try {
            const id = req.query.userId;
            const userData = await User.findById({ _id: id });

            userData.is_block = !userData.is_block
            await userData.save();

            if (userData.is_block) {
                  delete req.session.userId;
            }

            let message = userData.is_block ? "User Blocked successfully" : "User Unblocked successfully";

            res.status(200).json({ message })

      } catch (error) {
            console.log(error.message);
      }
}
 
 //--------------------------logOut-------------------------------------------//

 const logOut = asyncHandler(async(req,res)=>{
      req.session.destroy();
      res.redirect('/admin');
 })


module.exports = {
      signinLoad,
      adminLoad,
      dashboard,
      userLoad,
      updateUserStatus,
      logOut
}