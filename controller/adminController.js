const User = require('../Models/user');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const Order = require('../Models/order');
const Notification =require('../Models/notification')

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
            res.render('dashboard', { ActivePage: 'dashboard' });
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



            res.render('customerManagement', { users: userData, currentPage, totalPages, ActivePage: 'customerManagement' });
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

      res.render('customerManagement', {users,currentPage,totalPages,ActivePage: 'customerManagment'});
  });
  

 //----------------------------------Order page Load --------------------

 const orderPageLoad = asyncHandler(async(req,res)=>{
       const order = await Order.find({});
       const notifications = await Notification.find().sort({ date: -1 });
       res.render('orderManagment',{order,ActivePage: 'orderManagment',notifications})
 });

 //---------------------change order status -----------------------

 const updateOrderStatus = async (req, res) => {
      // console.log('oiuhyug');
      try {
        const { orderId, newStatus } = req.params;
        const order = await Order.findById(orderId);
        console.log('order=='+order);
        if (order) {
          order.orderStatus = newStatus;
          await order.save();
          res.status(200).json({ success: true });
        } else {
          res.status(404).json({ success: false, message: "Order not found" });
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: "An error occurred while updating the order status." });
      }
    };


//--------------------------------Order Details -------------------------------------

const OrderDetailPage = asyncHandler(async (req, res) => {
      const orderId = req.query.id;
      // console.log("orderId: " + orderId);
    
      const orderStatusEnum = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Completed', 'Return requested', 'Return approved', 'Return Rejected', 'Refunded'];
      const order = await Order.findById(orderId).populate('user').exec();
    
      res.render('order-detail', { order, orderStatusEnum , ActivePage: 'order-detail' });
    });
    

//---------------------------------------aprove to return ---------------------------------

const aproveToReturn = asyncHandler(async(req,res)=>{
      const {orderId,newStatus} = req.body;

      const order = await Order.findById(orderId);
      if(!order){
            return res.status(400).json({message:'Order Not Found'});
      }

      order.orderStatus = newStatus ;
      await order.save();

      res.status(200).json({message:'Order status updated successfully'});
});

//-----------------------------Sales Report ----------------------------

const salesReportPage   = asyncHandler(async(req,res)=>{
      const order = await Order.find({});
      res.render('salesReport',{ ActivePage: 'salesReport',order});
});



//-----------------------------filter the sales report ---------------------


// const filterSalesReport = asyncHandler(async(req,res)=>{
//       const { sortOrders } = req.query;
//       const startDate = req.query.startDate
//       const endDate = req.query.endDate


//     let filter = {};

//     if (startDate && endDate) {
//         filter.orderDate = {
//             $gte: new Date(startDate),
//             $lte: new Date(endDate),
//         };
//     }

//     if (sortOrders) {
//         const now = new Date();
//         switch (sortOrders) {
//             case 'Daily':
//                 filter.orderDate = {$gte:new Date(new Date().setHours(0, 0, 0, 0)), $lte: new Date(new Date().setHours(23, 59, 59, 999))} ;
//                 break;
//             case 'Week':
//                 filter.orderDate = { $gte:  new Date(),$lte:new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000) };
//                 break;
//             case 'Month':
//                 filter.orderDate = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
//                 break;
//             case 'Year':
//                 filter.orderDate = { $gte:  new Date(new Date().getFullYear(), 0, 1),$lte: new Date(new Date().getFullYear() + 1, 0, 0) };
//                 break;
//         }
//     }

//     const orders = await Order.find(filter)
//         .populate('user')
//         .populate('orderItem.productId');

//       //   console.log("ediiiiiiiiiiiii",orders);

//     res.json({ orders });

// });



// const filterSalesReport = asyncHandler(async (req, res) => {
//       const { sortOrders, startDate, endDate } = req.query;
  
//       let filter = {};
  
//       if (startDate && endDate) {
//           filter.orderDate = {
//               $gte: new Date(startDate),
//               $lte: new Date(endDate),
//           };
//       }
  
//       if (sortOrders) {
//           const now = new Date();
//           switch (sortOrders) {
//               case 'Daily':
//                   filter.orderDate = {
//                       $gte: new Date().setHours(0, 0, 0, 0),
//                       $lte: new Date().setHours(23, 59, 59, 999),
//                   };
//                   break;
//               case 'Week':
//                   filter.orderDate = {
//                       $gte: new Date(now.setDate(now.getDate() - 7)).setHours(0, 0, 0, 0),
//                       $lte: new Date().setHours(23, 59, 59, 999),
//                   };
//                   break;
//               case 'Month':
//                   filter.orderDate = {
//                       $gte: new Date(now.setMonth(now.getMonth() - 1)),
//                       $lte: new Date(),
//                   };
//                   break;
//               case 'Year':
//                   filter.orderDate = {
//                       $gte: new Date(new Date().getFullYear(), 0, 1),
//                       $lte: new Date(new Date().getFullYear(), 11, 31),
//                   };
//                   break;
//           }
//       }
  
//       try {
//           const orders = await Order.find(filter)
//               .populate('user')
//               .populate('orderItem.productId');
  
//               console.log('daily order ========'+orders);

//           res.json({ orders });

//       } catch (error) {
//           console.error('Error fetching orders:', error);
//           res.status(500).json({ message: 'An error occurred while fetching orders' });
//       }
//   });

const filterSalesReport = asyncHandler(async (req, res) => {
      const { sortValue} = req.body;
      const { startDate, endDate } =req.query ;
      console.log("sortedOrders >>>>",sortValue);
      
  
      let filter = {};
  
      if (startDate && endDate) {
          filter.orderDate = {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
          };
      }
  
      if (sortValue) {
          const now = new Date();
          if (sortValue === 'Daily') {
              filter.orderDate = {
                  $gte: new Date().setHours(0, 0, 0, 0),
                  $lte: new Date().setHours(23, 59, 59, 999),
              };
          } else if (sortValue === 'Week') {
              filter.orderDate = {
                  $gte: new Date(now.setDate(now.getDate() - 7)).setHours(0, 0, 0, 0),
                  $lte: new Date().setHours(23, 59, 59, 999),
              };
          } else if (sortValue === 'Month') {
              filter.orderDate = {
                  $gte: new Date(now.setMonth(now.getMonth() - 1)),
                  $lte: new Date(),
              };
          } else if (sortValue === 'Year') {
              filter.orderDate = {
                  $gte: new Date(new Date().getFullYear(), 0, 1),
                  $lte: new Date(new Date().getFullYear(), 11, 31),
              };
          }
      }
  
      try {

          const orders = await Order.find(filter)
              .populate('user')
              .populate('orderItem.productId');
  
      //     if (sortValue === 'Daily') {
      //         console.log('Daily orders:', orders);
      //     }
      // console.log("sortedOrders >>>>",sortOrders);
      console.log("orders data  >>>>",orders.length);
          res.json({ orders });
      } catch (error) {
          console.error('Error fetching orders:', error);
          res.status(500).json({ message: 'An error occurred while fetching orders' });
      }
  });
  
  

//-----------------------------------


 //-----------------------------------------------------------------------------------

module.exports = {
      signinLoad,
      adminLoad,
      dashboard,
      userLoad,
      updateUserStatus,
      logOut,
      SearchUser,
      orderPageLoad,
      updateOrderStatus,
      OrderDetailPage,
      aproveToReturn,
      salesReportPage ,
      // dailySalesReport 
      filterSalesReport
}