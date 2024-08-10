const Order = require('../Models/order');
const asyncHandler = require('express-async-handler')

const fetchOrders = asyncHandler(async (req, res, next) => {
      const orders = await Order.find({}).populate('user').populate('orderItem.productId').populate('orderItem.category');
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found' });
      }
      req.orders = orders;
      next();
    });
    

module.exports = fetchOrders;
