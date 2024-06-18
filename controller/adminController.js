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
            password = req.body.password;
            const adminData = await User.findOne({ email: email });
            console.log('admin' + adminData);
            if (adminData) {
                  const passwordCheck = await bcrypt.compare(password, adminData.password);

                  if (passwordCheck) {
                        if (adminData.is_Admin === false) {
                              res.render('login', { message: 'Invalid email and password' });
                        } else {
                              req.session.admin_id = adminData._id;
                              res.redirect('/admin/dashboard');
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


//-------------------------------------dashboard loading----------------------------------------------------------

const dashboard = async (req, res) => {
      try {
            res.render('dashboard');
      } catch (error) {
            console.log(error.message);
      }
}

//--------------------------------------rendering User details -------------------------------------------------

const userLoad = async (req, res) => {
      try {


            const FirstPage = 10;
            const currentPage = parseInt(req.query.page) || 1;

            const start = (currentPage - 1) * FirstPage;

            const userData = await User.find({ is_Admin: false }).skip(start).limit(FirstPage);
            const user = await User.countDocuments({ is_Admin: false });
            const totalPages = Math.ceil(user / FirstPage);



            res.render('customerManagement', { users: userData, currentPage, totalPages });
      } catch (error) {
            console.log(error.message);
      }
}

//-------------------------------Admin Bock And Unblock User--------------------------------- 

const updateUserStatus = async (req, res) => {
      try {
            const id = req.query.userId;
            const userData = await User.findById({ _id: id });

            userData.is_block = !userData.is_block
            await userData.save();

            if (userData.is_block) {
                  delete req.session.userData_id;
            }

            let message = userData.is_block ? "User Blocked successfully" : "User Unblocked successfully";

            res.status(200).json({ message })

      } catch (error) {
            console.log(error.message);
      }
}

//--------------------------logOut-------------------------------------------//

const logOut = asyncHandler(async (req, res) => {
      req.session.destroy();
      res.redirect('/admin');
})


//-------------------------------Search User -----------------------------------------//

const SearchUser = asyncHandler(async (req, res) => {

      let users = [];
      const currentPage = parseInt(req.query.page);
      const FirstPage = 10;
      const start = (currentPage - 1) * FirstPage;
      const user = await User.countDocuments({ is_Admin:false });
      const totalPages = Math.ceil(user / FirstPage);

      const userData = {
            $or:[{Fname: { $regex: req.query.search, $options: 'i'}},
              {email: { $regex: req.query.search, $options: 'i' }}]}
      

       if(req.query.search){
             users = await User.find(userData).skip(start).limit(FirstPage)
       }else{
             users =await User.find().skip(start).limit(FirstPage);
       }

      res.render('customerManagement', {users,currentPage,totalPages});
  });
  


module.exports = {
      signinLoad,
      adminLoad,
      dashboard,
      userLoad,
      updateUserStatus,
      logOut,
      SearchUser
}