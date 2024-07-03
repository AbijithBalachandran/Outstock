const Cart = require('../Models/cart');
const User = require('../Models/user');
const Products = require('../Models/products');
const asyncHandler = require('express-async-handler');
const Address = require('../Models/address');
const Order = require('../Models/order');

//----------------------------------------------------------


//------------------rendering checkout page----------------

const checkoutPageLoade = asyncHandler(async (req, res) => {

      const userId = req.session.userData_id;
      const user = await User.findById(userId);
      const cart = await Cart.find({ user: userId }).populate('cartItem.products');
      const address = await Address.find({ user: userId });
      const total = cart[0].cartItem.reduce((acc, val) => {
            acc += val.products.price * val.quantity
            return acc
      }, 0);
      res.render('checkout', { address, cart, total, user });

});

//------------------address showing the checkout page -----------------

const getAddress = asyncHandler(async (req, res) => {
      const { id } = req.query;

      const address = await Address.findById(id);
      if (!address) {
            return res.status(404).json({ error: 'Address not found' });
      }
      res.status(200).json(address);

});

//-------------checkout submition-------------------------------------------

const checkoutSubmit = asyncHandler(async (req, res) => {
      console.log('hello');
      const userId = req.session.userData_id;
      console.log(userId);
      const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');
      console.log(cart);
      let productId
      //update the stock
      cart.cartItem.forEach((item) => {
            productId = item.products._id;
            const quantity = item.quantity;
            Products.updateOne({ _id: productId },
                  { $inc: { quantity: -quantity } });
      });
      // empty the cart------
      await Cart.updateOne({ user: userId }, { $set: { cartItem: [] } });

      //----------save to order schema


      const orderItems = cart.cartItem.map(item => ({
            productId: item.products._id,
            quantity: item.quantity,
            productName: item.products.name,
            price: item.products.price,
            images: item.products.images,
            category: item.products.category,
            type: item.products.type,
            discount: item.products.discount,
            description: item.products.description,
            action: item.products.action,
            disPrice: item.products.disPrice,
            createdAt: new Date(),
            is_Delete: false
      }));


      const { firstName, address, landmark, city, phone, pincode, email,paymentMethod } = req.body;

      const order = new Order({
            user: userId,
            orderItem: orderItems,
            address: [{
                  userName: firstName,
                  address: address,
                  phone: phone,
                  landmark: landmark,
                  city: city,
                  pincode: pincode,
                  email: email
            }],
            paymentMethod: paymentMethod,
      });

      await order.save();
      
      // res.status(200);
      res.redirect('/home')

});

//----------------------------MY Order page rendering-----------------------------------

const myOrederLoad = asyncHandler(async(req,res)=>{
      const userId = req.query.id;
      const user = await User.findById(userId);
      const order = await Order.find({user:userId}).populate('user');
      console.log('order========'+order);
      res.render('orders',{user,order});
  });
  
//----------------------------------whishlist---------------------------------------

const whishlistLoad = asyncHandler(async(req,res)=>{
      const userId = req.query.id;
      const user = await User.findById(userId);
      // console.log('user'+user);
      res.render('wishlist',{user});
});

//-----------------------------------------------------------------------

module.exports = {
      checkoutPageLoade,
      getAddress,
      checkoutSubmit,
      whishlistLoad, 
      myOrederLoad
}