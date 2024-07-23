const Cart = require('../Models/cart');
const User = require('../Models/user');
const Products = require('../Models/products');
const asyncHandler = require('express-async-handler');


//----------------------------------Cart Page Rendering------------------------------//

const cartLoad = asyncHandler(async (req, res) => {
  const userId = req.query.id;
  const user = await User.findById(userId);
  const cart = await Cart.find({ user: userId }).populate('cartItem.products');
   
  let cartCount=0;
  let total =0;

  if (!cart || cart.length === 0) {
    cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
    const total = cart[0].cartItem.reduce((acc, val) => {
        acc += val.products.price * val.quantity;
        return acc;
    }, 0);

      res.render('cart', { user, cartItems: [], total,cartCount });
      return;
  }

  res.render('cart', { user, cartItems: cart, total, cartCount  });
});


//-------------------------------Add Product to Cart--------------------------------//


const cartProduct = asyncHandler(async (req, res) => {
  const userId = req.session.userData_id;
  const productId = req.query.id;

  
  const product = await Products.findById(productId);
  if (!product) {
      return res.status(404).json({ message: 'Product not found' });
  }

  if (product.quantity < 1) {
      return res.status(400).json({ message: 'Product out of stock' });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
      cart = new Cart({ user: userId, cartItem: [{ products: productId }] });
  }

  const existingItem = cart.cartItem.find(item => item.products.toString() === productId);
  if (existingItem) {
      return res.status(200).json({ exist: 'product exist' });
  } else {
      cart.cartItem.push({ products: productId, quantity: 1 });
      product.quantity -= 1; 
  }

  await product.save();
  await cart.save();

  res.status(200).json({ message: 'Product added to cart successfully' });
});

//-----------------------------remove cart product ----------------------------------

const removeProduct = asyncHandler(async (req, res) => {
  const productId = req.body.productId;
  const userId = req.body.userId;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const index = cart.cartItem.findIndex(item => item.products.toString() === productId);

  if (index !== -1) {
      const product = await Products.findById(productId);
      if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const removedItem = cart.cartItem[index];
      product.quantity += removedItem.quantity; 

      cart.cartItem.splice(index, 1); 

      await product.save();
      await cart.save();

      res.sendStatus(200);
  } else {
      res.status(404).json({ success: false, message: 'Product not found in cart' });
  }
});

//----------------------------------Update and adjest the product quantity ----------------------

const updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const count = parseInt(quantity);
  const userId = req.session.userData_id;

  if (!Number.isInteger(count) || count < 1 || count > 5) {
      return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 5' });
  }

  const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');
  if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const product = cart.cartItem.find(item => item.products._id.toString() === productId);
  if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
  }

  const productData = await Products.findById(productId);
  if (!productData) {
      return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const stockChange = count - product.quantity;
  if (productData.quantity < stockChange) {
      return res.status(400).json({ success: false, message: 'Insufficient stock', quantity: product.quantity });
  }

  productData.quantity -= stockChange; 
  product.quantity = count;

  await productData.save();
  await cart.save();

  const updatedCart = await Cart.findOne({ user: userId }).populate('cartItem.products');
  const total = updatedCart.cartItem.reduce((acc, val) => {
      acc += val.products.price * val.quantity;
      return acc;
  }, 0);

  return res.status(200).json({ success: true, total: total });
});
      
//------------------------------------------------------------------------------

module.exports={
      cartLoad,
      cartProduct,
      removeProduct,
      updateQuantity
}