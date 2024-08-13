const User = require('../Models/user');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const Order = require('../Models/order');
const Notification =require('../Models/notification')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose')
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
      const bestSellingCategories = await Order.aggregate([
        { $unwind: "$orderItem" },
        {
            $group: {
                _id: "$orderItem.category",
                totalSold: { $sum: "$orderItem.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        { $unwind: "$categoryDetails" },
        {
            $project: {
                _id: 1,
                totalSold: 1,
                categoryName: "$categoryDetails.name"
            }
        }
    ]);
      return {bestSellingProducts,bestSellingCategories};

  } catch (error) {
      console.error("Error fetching best-selling products:", error);
      throw error;
  }
};


//-----------------------------------dashboard page Load ------------------------------------------------------------------------------------------

const dashboard = async (req, res) => {
      try {
        const currentRange = req.query.timeRange || 'all';

        const order = await Order.find({});


    // Calculate total sold products and total revenue
    const totalSoldProducts = order.reduce((total, order) => {
      return total + order.orderItem.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    const totalRevenue = order.reduce((total, order) => {
      return total + order.orderItem.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }, 0);

    // Fetch total users count
    const totalUsers = await User.countDocuments({});

    // Calculate today's sold products count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      orderDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const todaySoldProducts = todayOrders.reduce((total, order) => {
      return total + order.orderItem.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

        const salesData = await Order.aggregate([
          { $unwind: "$orderItem" },
          {
            $group: {
              _id: "$orderItem.category",
              totalSales: { $sum: { $multiply: ["$orderItem.quantity", "$orderItem.price"] } }
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category"
            }
          },
          { $unwind: "$category" },
          {
            $project: {
              _id: 0,
              category: "$category.name",
              totalSales: 1
            }
          }
        ]);
    
        const {bestSellingProducts,bestSellingCategories} = await getBestSellingProducts();

        res.render('dashboard', {
          ActivePage: 'dashboard',
          salesData: JSON.stringify(salesData),
          currentRange: currentRange,
          bestSellingProducts,
          bestSellingCategories,
          order,
          totalSoldProducts,
          totalRevenue,
          totalUsers,
          todaySoldProducts
        });
    
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
      }
    };
    


   
//-------------------------------------Dashboard  Filter ------------------------------------------------------

const dashboardFilter = async (req, res) => {
      try {
        const { range } = req.body;
        let matchCondition = {};
    
        const now = new Date();
        if (range === 'daily') {
          matchCondition = {
            orderDate: {
              $gte: new Date(now.setHours(0, 0, 0, 0)),
              $lte: new Date(now.setHours(23, 59, 59, 999))
            }
          };
        } else if (range === 'weekly') {
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          matchCondition = {
            orderDate: {
              $gte: startOfWeek,
              $lte: endOfWeek
            }
          };
        } else if (range === 'monthly') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          matchCondition = {
            orderDate: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          };
        } else if (range === 'yearly') {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const endOfYear = new Date(now.getFullYear(), 11, 31);
          matchCondition = {
            orderDate: {
              $gte: startOfYear,
              $lte: endOfYear
            }
          };
        }
    
        const salesData = await Order.aggregate([
          { $unwind: "$orderItem" },
          { $match: matchCondition },
          {
            $group: {
              _id: "$orderItem.category",
              totalSales: { $sum: { $multiply: ["$orderItem.quantity", "$orderItem.price"] } }
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category"
            }
          },
          { $unwind: "$category" },
          {
            $project: {
              _id: 0,
              category: "$category.name",
              totalSales: 1
            }
          }
        ]);
    
        res.json({ salesData }); 
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
      }
    };
    
    

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

            if (!id  || !mongoose.Types.ObjectId.isValid(id )) { 
              return res.status(404).redirect('/admin/404')
             }
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

            const FirstPage = 10;
            const currentPage = parseInt(req.query.page) || 1;

            const start = (currentPage - 1) * FirstPage;

            const orderData = await Order.find({}).skip(start).limit(FirstPage);
            const orderCount = await Order.countDocuments({}); 
            const totalPages = Math.ceil(orderCount / FirstPage);


      //  const order = await Order.find({});
       const notifications = await Notification.find().sort({ date: -1 });
       res.render('orderManagment',{order:orderData, currentPage, totalPages ,ActivePage: 'orderManagment',notifications})
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
      
      if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) { 
        return res.status(404).redirect('/admin/404')
       }
       if(!orderId){
        return res.status(404).redirect('/admin/404')
       }

    
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

      const FirstPage = 7;
      const currentPage = parseInt(req.query.page) || 1;
      const filterParams = {}; 
      if (req.query.startDate) {
        filterParams.startDate = req.query.startDate;
      }
      if (req.query.endDate) {
        filterParams.endDate = req.query.endDate;
      }
      
      const start = (currentPage - 1) * FirstPage;
      const orderData = await Order.find(filterParams).skip(start).limit(FirstPage);
      const orderCount = await Order.countDocuments(filterParams); 
      const totalPages = Math.ceil(orderCount / FirstPage);

      res.render('salesReport',{ order: orderData, currentPage, totalPages , filterParams , ActivePage: 'salesReport'});

});



//-----------------------------filter the sales report ---------------------

const filterSalesReport = asyncHandler(async (req, res) => {

      const { sortValue,startDate, endDate} = req.body;
  
      let filterCriteria = {};
  
      if (startDate && endDate) {
            filterCriteria.orderDate = {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
          };
      }
  
      if (sortValue) {
          const now = new Date();
          if (sortValue === 'Daily') {
            filterCriteria.orderDate = {
                  $gte: new Date().setHours(0, 0, 0, 0),
                  $lte: new Date().setHours(23, 59, 59, 999),
              };
          } else if (sortValue === 'Week') {
            filterCriteria.orderDate = {
                  $gte: new Date(now.setDate(now.getDate() - 7)).setHours(0, 0, 0, 0),
                  $lte: new Date().setHours(23, 59, 59, 999),
              };
          } else if (sortValue === 'Month') {
              filterCriteria.orderDate = {
                  $gte: new Date(now.setMonth(now.getMonth() - 1)),
                  $lte: new Date(),
              };
          } else if (sortValue === 'Year') {
              filterCriteria.orderDate = {
                  $gte: new Date(new Date().getFullYear(), 0, 1),
                  $lte: new Date(new Date().getFullYear(), 11, 31),
              };
          }
      }
  
      try {

          const orders = await Order.find(filterCriteria)
              .populate('user')
              .populate('orderItem.productId');
  
              res.json({ orders });
      } catch (error) {
          console.error('Error fetching orders:', error);
          res.status(500).json({ message: 'An error occurred while fetching orders' });
      }
  });
  

//-----------------------------custom filter --------------------------

const customFilter = asyncHandler(async(req,res)=>{

      const { startDate, endDate } = req.body;

    let filterCriteria = {};

    if (startDate && endDate) {
        filterCriteria.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    try {
        const orders = await Order.find(filterCriteria).populate('orderItem.product');
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales report', error });
    }

});


//--------------------------------------PDF download --------------------------------------

const generatePDF = asyncHandler(async (req, res) => {
  const orders = req.orders; // Assuming req.orders is populated with the order data

  const doc = new PDFDocument();
  let filename = 'sales_report.pdf';
  filename = encodeURIComponent(filename);

  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.pipe(res);

  doc.fontSize(16).text('Sales Report', { align: 'center' });
  doc.moveDown(2);

  const tableTop = doc.y;
  const itemCodeX = 50;
  const descriptionX = 150;
  const quantityX = 300;
  const priceX = 350;
  const discountX = 400;
  const totalX = 450;
  const paymentMethodX = 500;

  // Table Header
  doc.fontSize(10).text('Order ID', itemCodeX, tableTop);
  doc.text('Product Name', descriptionX, tableTop);
  doc.text('Quantity', quantityX, tableTop);
  doc.text('Price', priceX, tableTop);
  doc.text('Discount', discountX, tableTop);
  doc.text('Total Price', totalX, tableTop);
  doc.text('Payment Method', paymentMethodX, tableTop);
  doc.moveDown();


  orders.forEach(order => {
    const y = doc.y;
    doc.fontSize(6).text(order._id, itemCodeX, y);

    order.orderItem.forEach((orderItem, index) => {
      const orderItemY = y + (index * 2 );
      
      doc.text(orderItem.productName, descriptionX, orderItemY);
      doc.text(orderItem.quantity.toString(), quantityX, orderItemY);
      doc.text(`${orderItem.price}`, priceX, orderItemY);

      if (index === 0) {
        doc.text(order.couponDetails.discount || order.offerDetails.discount || 'N/A', discountX, orderItemY);
        doc.text(`${order.totalPrice}`, totalX, orderItemY);
        doc.text(order.paymentMethod, paymentMethodX, orderItemY);
      }
    });

    doc.moveDown(order.orderItem.length * 2); 
  });

  doc.end();
});

//---------------------------------excel Download ---------------------------------

const generateExcel = asyncHandler(async (req, res) => {
  const orders = req.orders; 

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 30 },
    { header: 'Product Name', key: 'productName', width: 30 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Discount', key: 'discount', width: 15 },
    { header: 'Total Price', key: 'totalPrice', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 20 }
  ];

  orders.forEach(order => {
    order.orderItem.forEach(orderItem => {
      worksheet.addRow({
        id: order._id.toString(), 
        productName: orderItem.productName,
        quantity: orderItem.quantity,
        price: orderItem.price,
        discount: order.couponDetails?.discount || order.offerDetails?.discount || 'N/A',
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod
      });
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});


  
//------------------------------------------------dashbord chart representation -------------------------

const getSalesData = asyncHandler (async(req, res) => {
      try {
        const salesData = await Order.aggregate([
          { $unwind: "$orderItem" },
          { 
            $group: {
              _id: "$orderItem.category",
              totalSales: { $sum: { $multiply: ["$orderItem.quantity", "$orderItem.price"] } }
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "category"
            }
          },
          { $unwind: "$category" },
          { 
            $project: {
              _id: 0,
              category: "$category.name",
              totalSales: 1
            }
          }
        ]);
    
        res.json(salesData);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });



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
      filterSalesReport,
      customFilter,
      generatePDF,
      generateExcel,
      getSalesData,
      dashboardFilter
}