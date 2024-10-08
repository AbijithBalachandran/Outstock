const User = require('../Models/user');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const Order = require('../Models/order');
const Notification =require('../Models/notification')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const Wallet = require('../Models/wallet');
const Product = require('../Models/products');

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
          },
          { $match: { category: { $ne: null } } }
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
          todaySoldProducts,
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
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      matchCondition = {
        orderDate: {
          $gte: startOfDay,
          $lte: endOfDay
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
          },
          { $match: { category: { $ne: null } } }
        ]);
    
        const bestSellingProducts = await getBestSellingProducts();
    
        res.json({ salesData: { categories: salesData, products: bestSellingProducts } });

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

            const userData = await User.find({ is_Admin: false }).sort({createdAt:-1}).skip(start).limit(FirstPage);
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

            const orderData = await Order.find({}).sort({createdAt:-1}).skip(start).limit(FirstPage);
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

      console.log('aroved status',newStatus);
      
      const order = await Order.findById(orderId);
      if(!order){
            return res.status(400).json({message:'Order Not Found'});
      }
      const userId = order.user; 

      let refundAmount = 0;
      if ( newStatus === 'Return approved') {
          for (let item of order.orderItem) {
              const product = await Product.findById(item.productId).populate('offer');
              if (product) {
                  // const discount = order.offerDetails.discount || order.couponDetails.discount;
                  refundAmount = order.totalPrice;

                  // console.log('product.offer.discount===', discount);
                  console.log('refundAmount ===', refundAmount);
              }
          }

          await Wallet.findOneAndUpdate(
              { userId: userId },
              {
                  $inc: { walletAmount: refundAmount },
                  $push: {
                      transaction: {
                          amount: refundAmount,
                          PaymentType: 'Refund',
                          date: new Date()
                      }
                  }
              },
              { upsert: true }
          );
          console.log(`Updated wallet for user ${order.user}: new balance is ${Wallet.walletAmount}`);
      }
    
      
      
      order.orderStatus = newStatus ;
      await order.save();

      res.status(200).json({message:'Order status updated successfully'});
});

//-----------------------------Sales Report ----------------------------

const salesReportPage = asyncHandler(async (req, res) => {
  const FirstPage = 7;
  const currentPage = parseInt(req.query.page) || 1;

  const filterParams = {};

  // Filter by date if provided
  if (req.query.startDate && req.query.endDate) {
    filterParams.orderDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  // Filter by status for delivered and completed orders
  filterParams.orderStatus = {
    $in: ['Delivered', 'Completed']
  };

  // Apply sort filter if specified
  if (req.query.sortValue) {
    const now = new Date();
    if (req.query.sortValue === 'Daily') {
      filterParams.orderDate = {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      };
    } else if (req.query.sortValue === 'Week') {
      filterParams.orderDate = {
        $gte: new Date(now.setDate(now.getDate() - 7)).setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      };
    } else if (req.query.sortValue === 'Month') {
      filterParams.orderDate = {
        $gte: new Date(now.setMonth(now.getMonth() - 1)),
        $lte: new Date(),
      };
    } else if (req.query.sortValue === 'Year') {
      filterParams.orderDate = {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lte: new Date(new Date().getFullYear(), 11, 31),
      };
    }
  }

  const start = (currentPage - 1) * FirstPage;
  const orderData = await Order.find(filterParams).sort({createdAt:-1}).skip(start).limit(FirstPage);
  const orderCount = await Order.countDocuments(filterParams);
  const totalPages = Math.ceil(orderCount / FirstPage);

  const order = await Order.find(filterParams)

  const totalSales= order.length;
  let totalRevenue = 0;
  order.forEach(order=>{
    totalRevenue += order.totalPrice;
    return totalRevenue
  });

  let totalDiscount = 0;
  order.forEach(order=>{
    totalDiscount +=  (order.offerDetails.discount+order.couponDetails.discount)||order.offerDetails.discount||order.couponDetails.discount;
    return totalDiscount;
  })


  res.render('salesReport', { 
    order: orderData, 
    currentPage, 
    totalPages, 
    filterParams, 
    ActivePage: 'salesReport',
    totalSales,
    totalRevenue,
    totalDiscount
  });
});



//-----------------------------filter the sales report ----------------------------------------------------------------------------------------------

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
  const filterParams = {};

  // Filter by date if provided
  if (req.query.startDate && req.query.endDate) {
    filterParams.orderDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  // Filter by status for delivered and completed orders
  filterParams.orderStatus = {
    $in: ['Delivered', 'Completed']
  };

  // Apply sort filter if specified
  if (req.query.sortValue) {
    const now = new Date();
    if (req.query.sortValue === 'Daily') {
      filterParams.orderDate = {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      };
    } else if (req.query.sortValue === 'Week') {
      filterParams.orderDate = {
        $gte: new Date(now.setDate(now.getDate() - 7)).setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      };
    } else if (req.query.sortValue === 'Month') {
      filterParams.orderDate = {
        $gte: new Date(now.setMonth(now.getMonth() - 1)),
        $lte: new Date(),
      };
    } else if (req.query.sortValue === 'Year') {
      filterParams.orderDate = {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lte: new Date(new Date().getFullYear(), 11, 31),
      };
    }
  }

  const orders = await Order.find(filterParams).sort({createdAt:-1}).populate('orderItem.productId');

  const doc = new PDFDocument({ margin: 30 });
  let filename = 'sales_report.pdf';
  filename = encodeURIComponent(filename);

  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.pipe(res);

  // Add Title
  doc.fontSize(16).text('Sales Report', { align: 'center' });
  doc.moveDown(2);


  
  const order = await Order.find(filterParams)

  const totalSales= order.length;
  let totalRevenue = 0;
  order.forEach(order=>{
    totalRevenue += order.totalPrice;
    return totalRevenue
  });

  let totalDiscount = 0;
  order.forEach(order=>{
    totalDiscount +=  (order.offerDetails.discount+order.couponDetails.discount)||order.offerDetails.discount||order.couponDetails.discount;
    return totalDiscount;
  })

  doc.fontSize(12).text(`Totale Sales : ${totalSales}`, { align: 'left'  });
  doc.text(`Total Revenue :${totalRevenue}`, { align: 'left'  });
  doc.text(`Total Discount :${totalDiscount}`, { align: 'left'  });
  doc.moveDown(2);

  // Table setup
  const tableTop = doc.y;
  const leftMargin = 10;
  const columnWidths = {
       "":0,
      orderId: 50,
      customer: 70,
      productName: 90,
      quantity: 50,
      price: 50,
      discount: 50,
      totalPrice: 70,
      purchaseAmount: 80,  
      paymentMethod: 80
  };

  const rowHeight = 30; 

  // Draw headers
  let headerX = leftMargin; // Starting X coordinate for the headers
  doc.fontSize(10).font('Helvetica-Bold');

  Object.keys(columnWidths).forEach((key) => {
      const width = columnWidths[key];
      doc.text(key.replace(/([A-Z])/g, ' $1').trim(), headerX + 2, tableTop + 2, {
          width: width - 4,
          align: 'center'
      });
      headerX += width;

      // Draw header borders
      doc.moveTo(headerX - width, tableTop) 
          .lineTo(headerX, tableTop)
          .lineTo(headerX, tableTop + rowHeight)
          .lineTo(headerX - width, tableTop + rowHeight)
          .lineTo(headerX - width, tableTop)
          .stroke();
  });

  // Move to the next line for the table content
  let rowY = tableTop + rowHeight;
  let previousOrderId = null; // Track the previous order ID

  // Add Table Rows with borders
  orders.forEach(order => {
      order.orderItem.forEach((item, index) => {
          let rowX = leftMargin; // Starting X coordinate for the rows

          // Draw row cells
          doc.fontSize(9).font('Helvetica');

          // Draw cells only if it's the first item of the order or if the order ID changes
          if (index === 0 || order.orderId !== previousOrderId) {
              doc.text(order.orderId, rowX + 2, rowY + 2, {
                  width: columnWidths.orderId - 4,
                  align: 'center'
              });

              rowX += columnWidths.orderId;
              doc.text(order.address.userName, rowX + 2, rowY + 2, {
                  width: columnWidths.customer - 4,
                  align: 'center'
              });
              rowX += columnWidths.customer;
          } else {
              rowX += columnWidths.orderId + columnWidths.customer;
          }

          doc.text(item.productName, rowX + 2, rowY + 2, {
              width: columnWidths.productName - 4,
              align: 'center'
          });
          rowX += columnWidths.productName;

          doc.text(item.quantity.toString(), rowX + 2, rowY + 2, {
              width: columnWidths.quantity - 4,
              align: 'center'
          });
          rowX += columnWidths.quantity;

          doc.text(item.price.toFixed(2), rowX + 2, rowY + 2, {
              width: columnWidths.price - 4,
              align: 'center'
          });
          rowX += columnWidths.price;

          // Calculate discount
          const discount = (order.offerDetails.discount + order.couponDetails.discount) || order.couponDetails?.discount || order.offerDetails?.discount || 0;
          if (index === 0 || order.orderId !== previousOrderId) {
              doc.text(discount.toFixed(2), rowX + 2, rowY + 2, {
                  width: columnWidths.discount - 4,
                  align: 'center'
              });
          }
          rowX += columnWidths.discount;

          // Calculate total price for each item
          const totalPrice = (item.price * item.quantity - discount).toFixed(2);
          doc.text(totalPrice, rowX + 2, rowY + 2, {
              width: columnWidths.totalPrice - 4,
              align: 'center'
          });
          rowX += columnWidths.totalPrice;

          if (index === 0 || order.orderId !== previousOrderId) {
              const purchaseAmount = order.totalPrice; 
              doc.text(purchaseAmount.toFixed(2), rowX + 2, rowY + 2, {
                  width: columnWidths.purchaseAmount - 4,
                  align: 'center'
              });
              rowX += columnWidths.purchaseAmount;

              doc.text(order.paymentMethod, rowX + 2, rowY + 2, {
                  width: columnWidths.paymentMethod - 4,
                  align: 'center'
              });
          }

          if (index === 0 || order.orderId !== previousOrderId) {
              // Draw the top border for the row
              doc.moveTo(leftMargin, rowY)
                  .lineTo(leftMargin + Object.values(columnWidths).reduce((a, b) => a + b), rowY)
                  .stroke();
          }


          let borderX = leftMargin;
          Object.values(columnWidths).forEach(width => {
              borderX += width;
              doc.moveTo(borderX, rowY)
                  .lineTo(borderX, rowY + rowHeight)
                  .stroke();
          });

          // Update the previous order ID
          previousOrderId = order.orderId;
          rowY += rowHeight;

          // Draw the bottom border only if it's the last item of the order
          if (index === order.orderItem.length - 1) {
              doc.moveTo(leftMargin, rowY)
                  .lineTo(leftMargin + Object.values(columnWidths).reduce((a, b) => a + b), rowY)
                  .stroke();
          }
      });

      doc.moveDown(0.5);

  });

  doc.moveDown(2);

  doc.end();
});



//---------------------------------excel Download ---------------------------------------------------------------------------------------------

const generateExcel = asyncHandler(async (req, res) => {
  const filterParams = {};

  // Filter by date range and sort value
  if (req.query.startDate && req.query.endDate) {
    filterParams.orderDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  if (req.query.sortValue) {
    const now = new Date();
    if (req.query.sortValue === 'Daily') {
      filterParams.orderDate = {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      };
    } else if (req.query.sortValue === 'Week') {
      filterParams.orderDate = {
        $gte: new Date(now.setDate(now.getDate() - 7)).setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      };
    } else if (req.query.sortValue === 'Month') {
      filterParams.orderDate = {
        $gte: new Date(now.setMonth(now.getMonth() - 1)),
        $lte: new Date(),
      };
    } else if (req.query.sortValue === 'Year') {
      filterParams.orderDate = {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lte: new Date(new Date().getFullYear(), 11, 31),
      };
    }
  }

  const orders = await Order.find(filterParams).sort({createdAt:-1}).populate('orderItem.productId');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 10 },
    { header: 'Customer Name', key: 'userName', width: 20 },
    { header: 'Product Name', key: 'productName', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Discount', key: 'discount', width: 15 },
    { header: 'Total Price', key: 'totalPrice', width: 15 },
    {header:'Purchase Amount',key:'parchaseAmt',width: 15},
    { header: 'Payment Method', key: 'paymentMethod', width: 20 },
  ];

  orders.forEach(order => {
    let isFirstProduct = true;
    order.orderItem.forEach(item => {
      worksheet.addRow({
        id: isFirstProduct ? order.orderId : '',
        userName: isFirstProduct ? order.address?.userName || 'UNKNOWN' : '',
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount:isFirstProduct ? order.couponDetails?.discount || order.offerDetails?.discount || 'N/A':'',
        totalPrice: (item.price * item.quantity - (order.couponDetails?.discount || 0)).toFixed(2),
        parchaseAmt:isFirstProduct ?order.totalPrice:'',
        paymentMethod: isFirstProduct ? order.paymentMethod : '',
      });
      isFirstProduct = false;
    });
  });


  const order = await Order.find(filterParams)

  const totalSales= order.length;
  let totalRevenue = 0;
  order.forEach(order=>{
    totalRevenue += order.totalPrice;
    return totalRevenue
  });

  let totalDiscount = 0;
  order.forEach(order=>{
    totalDiscount +=  (order.offerDetails.discount+order.couponDetails.discount)||order.offerDetails.discount||order.couponDetails.discount;
    return totalDiscount;
  })


// Add an empty row before summary
worksheet.addRow({});

// Adding summary rows
worksheet.addRow({ id: `Total Sales: ${totalSales}` });
worksheet.addRow({ id: `Total Revenue: ${totalRevenue.toFixed(2)}` });
worksheet.addRow({ id: `Total Discount: ${totalDiscount.toFixed(2)}` });

// Optionally, you can also style the summary rows
const lastRowNumber = worksheet.lastRow.number;

for (let i = lastRowNumber - 2; i <= lastRowNumber; i++) {
  worksheet.getRow(i).font = { bold: true };
  worksheet.getRow(i).getCell('id').alignment = { horizontal: 'left' };
}


  // Increase header size and font thickness
  worksheet.getRow(1).font = { size: 10, bold: true };

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