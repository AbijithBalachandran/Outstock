const Cart = require('../Models/cart');
const User = require('../Models/user');
const Products = require('../Models/products');
const asyncHandler = require('express-async-handler');


//----------------------------------Cart Page Rendering------------------------------//

const cartLoad = asyncHandler(async (req, res) => {
    const userId = req.query.id;
    const user = await User.findById(userId);
    const cart = await Cart.find({ user: userId }).populate('cartItem.products');

   if(cart && cart.length >0){
    count =cart[0].cartItem.length;
    console.log('count '+count);
   }
      

   const total = cart[0].cartItem.reduce((acc,val) =>{
    acc += val.products.price * val.quantity
    return acc
  },0);

    if (!cart) {
        res.render('cart', { user, cartItems: [] });
    } else {
        res.render('cart', {user:user, cartItems: cart , total:total,count:count});
    }
});

//-------------------------------Add Product to Cart--------------------------------//

const cartProduct = asyncHandler(async (req, res) => {
    const userId = req.session.userData_id;
    const productId  = req.query.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, cartItem: [{products:productId}] });
    }
    const existingItem = cart.cartItem.find(item => item.products.toString() === productId);
    if (existingItem) {
        res.status(200).json({exist:'product exist'});
    } else {
        cart.cartItem.push({ products: productId, quantity: 1 });
    }

     const addProduct=await cart.save();

    //  if(addProduct){
    //   res.status(200).json({success:'success'});
    //  }

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
      cart.cartItem.splice(index, 1);
      await cart.save();
     res.sendStatus(200);
    } else {
      res.status(404).json({ success: false, message: 'Product not found in cart' });
    }
  });
  

//----------------------------------Update and adjest the product quantity ----------------------


const updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const count = parseInt(quantity)
  const userId = req.session.userData_id;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
    return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 5' });
  }
  
  const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }
  const product = cart.cartItem.find(item => item.products._id.toString() === productId);
  const productData = await Products.findById({_id:productId})
  if (productData.quantity < count) {
    return res.status(200).json({ message: 'Insufficeint stock' , quantity:product.quantity});
  }
  product.quantity = count;
  
  await cart.save();
console.log('save');

  const cart1 = await Cart.findOne({ user: userId }).populate('cartItem.products');

const total = cart1.cartItem.reduce((acc,val) =>{
  acc += val.products.price * val.quantity
  return acc
},0)

if(total){
  return res.status(200).json({  total:total});
}

console.log(total);
  res.status(200).json({ success: true, totalPrice });
});


      
//------------------------------------------------------------------------------

module.exports={
      cartLoad,
      cartProduct,
      removeProduct,
      updateQuantity
}