const Cart = require('../Models/cart');
const User = require('../Models/user');
const Product = require('../Models/products');
const asyncHandler = require('express-async-handler');
const Address = require('../Models/address');
const Order = require('../Models/order');
const Razorpay = require('razorpay');
const Whishlist = require('../Models/wishlist');
const crypto = require('crypto');
const Coupon = require('../Models/coupon');
const Notification =require('../Models/notification');
const { log } = require('console');
const Offer = require('../Models/offer');
const Wallet = require('../Models/wallet');
require('dotenv').config();

//----------------------------------------------------------

//--------------Razorpay Instant ----------------

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_kEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

//------------------rendering checkout page------------------

const checkoutPageLoad = asyncHandler(async (req, res) => {
    const userId = req.session.userData_id;
    const couponId = req.session.couponId;
    // console.log('couponID'+couponId);
    const user = await User.findById(userId);
    const cart = await Cart.find({ user: userId }).populate('cartItem.products');
    const address = await Address.find({ user: userId });
    const coupon = await Coupon.find({});

    if (!cart || cart.length === 0) {
        return res.render('checkout', { address, cart: [], total: 0, user, coupon });
    }


    const shippingCharge = 100;

    const total = cart[0].cartItem.reduce((acc, val) => acc + val.products.price * val.quantity, 0);

    const offerProducts = cart[0].cartItem.filter(item => item.products.offer && item.products.offer.length > 0);

    // console.log('offer products ==='+offerProducts);
    // const offer = await Offer.find({})

    req.session.offerProducts = offerProducts;

    
    async function calculateOfferDiscount(product) {
        if (product.offer && product.offer.length > 0) {
            // Get the latest offer
            const latestOfferId = product.offer[product.offer.length - 1];
            const offerDetails = await Offer.findById(latestOfferId);
            if (offerDetails && offerDetails.offerStatus) {
                return product.price * (offerDetails.discount / 100);
            }
        }
        return 0;
    }
    let totalDiscount = 0;
    for (const item of offerProducts) {
        const discount = await calculateOfferDiscount(item.products);
        totalDiscount += discount * item.quantity;
    }

    // console.log('offered products discount '+ totalDiscount);
    
    let grandTotal = total + shippingCharge;
       if (offerProducts) {
        grandTotal -=totalDiscount
       }

    req.session.totalDiscount = totalDiscount;

    req.session.total =total;

    req.session.grandtotal = grandTotal;

    res.render('checkout', { address, cart, total, user, coupon, grandTotal, shippingCharge,couponId ,totalDiscount,offerProducts});
});



//------------------------------------ Create Razorpay order--------------------------------------------

const createOrder = asyncHandler(async (req, res) => {
    console.log('creareorder');
    const { userId } = req.query;
    const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');

    if (!cart || cart.cartItem.length === 0) {
        res.status(400).json({ error: "Cart is empty" });
        return;
    }

    const amount = cart.cartItem.reduce((acc, val) => acc + (val.products.price * val.quantity), 0) * 100;
    console.log('amount' + amount);

    const options = {
        amount: amount,
        currency: "INR",
        receipt: 'abijith',
    };
    console.log('options over');

    instance.orders.create(options, (err, order) => {
        if (!err) {
            res.status(200).json({
                success: true,
                msg: 'Order Created',
                order_id: order.id,
                amount: amount,
                key_id: process.env.RAZORPAY_kEY_ID,
                contact: "7593925598",
                name: "Abijith",
                email: "abijith24799@gmail.com",
            });

        }
        else {
            console.log(err);
            //     res.status(400).json({success:false,msg:'Something went wrong!'});
        }
    });

});

//-------------------------------------------------verifyPayment----------------------------------------

const verifyPayment = asyncHandler(async (req, res) => {

    // const discounttotal = req.session.totalDiscount;
    const offerProducts = req.session.offerProducts ;
   
    const couponId = req.session.couponId;
    const cartTotal = req.session.total;

    const { orderCreationId, razorpayPaymentId, razorpaySignature, userId, firstName, address, landmark, city, phone, pincode, email, paymentMethod } = req.body;

    // Log incoming data for debugging
    // console.log('Request Body:', req.body);

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
        res.status(400).json({ error: "Transaction not legit!" });
        return;
    }

    const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');

    if (!cart) {
        res.status(400).json({ error: "Cart not found!" });
        return;
    }

    // Update stock and clear cart
    await Promise.all(cart.cartItem.map(async (item) => {
        await Product.updateOne({ _id: item.products._id }, { $inc: { quantity: -item.quantity } });
    }));

    await Cart.updateOne({ user: userId }, { $set: { cartItem: [] } });

    const shippingCharge = 100;
    grandTotal = cartTotal + shippingCharge;


//-------------------offer apply --------------

let offerDetails = {
    offerName: "",
    discount: 0,
    offerType: ' ',
  };

  if(offerProducts){
     
      console.log('payment -==========offer ======'+offerProducts);
    // const offerProducts = cart.cartItem.filter(item => item.products.offer && item.products.offer.length > 0);   

    
    async function calculateOfferDiscount(product) {
        if (product.offer && product.offer.length > 0) {
            // Get the latest offer
            const latestOfferId = product.offer[product.offer.length - 1];
            const offerDetails = await Offer.findById(latestOfferId);
            if (offerDetails && offerDetails.offerStatus) {
                return product.price * (offerDetails.discount / 100);
            }
        }
        return 0;
    }
    let totalDiscount = 0;
    for (const item of offerProducts) {
        const discount = await calculateOfferDiscount(item.products);
        totalDiscount += discount * item.quantity;
    }

    offerDetails ={
        offerName:offerDetails.offerName,
        discount: totalDiscount,
        offerType: offerDetails.offerType,
    }

    grandTotal -=totalDiscount;
  }
    
 //----------------coupon appply--------------------------

 let couponDetails = {
    code: "",
    discount: 0,
    miniPurchaseAmt: 0,
    maxredeemableAmt: 0
  };

 if(couponId){
     const coupon = await Coupon.findOne({_id:couponId });
    //  console.log('coupon'+coupon);
     if(!coupon ){
         return res.status(400).json({ success: false, message: 'Coupon is not valid' });

     }
     const shippingCharge = 100;
     let grandTotal = cartTotal + shippingCharge;
    //  console.log('first grandTotal'+grandTotal);
     const discountAmount = cartTotal * (coupon.discount / 100);
   const couponDiscount = Math.min(
         discountAmount,
         coupon.maxredeemableAmt || coupon.maxredeemableAmt
   );

   couponDetails ={
     code:coupon.code,
     discount:couponDiscount,
     miniParchaseAmt:coupon.miniParchaseAmt,
     maxredeemableAmt:coupon.maxredeemableAmt
   }

   grandTotal -=couponDiscount;
 }

console.log('grandTotal'+grandTotal);

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

    const order = new Order({
        user: userId,
        orderItem: orderItems,
        address: {
            userName: firstName,
            address: address,
            phone: phone,
            landmark: landmark,
            city: city,
            pincode: pincode,
            email: email
        }, 
        offerDetails:offerDetails,
        totalPrice:grandTotal,
        couponDetails:couponDetails,
        paymentMethod: paymentMethod,
        orderStatus: "Processing",
    });

    const orderData = await order.save();

    // Log the order data for debugging
    console.log('OrderData:', orderData);

    res.status(200).json({ success: true, orderId: orderData._id });
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
    const offerProducts = req.session.offerProducts ;
    const userId = req.session.userData_id;
    const couponId = req.session.couponId;
    console.log('couponCode====='+couponId);
    const cartTotal = req.session.total;

    // console.log(userId);
    const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');
    console.log(cart);
    let productId
    //update the stock
    cart.cartItem.forEach((item) => {
        productId = item.products._id;
        const quantity = item.quantity;
        Product.updateOne({ _id: productId },
            { $inc: { quantity: -quantity } });
    });
    // empty the cart------
    await Cart.updateOne({ user: userId }, { $set: { cartItem: [] } });

    const shippingCharge = 100;
    grandTotal = cartTotal + shippingCharge;


//-----------------offer apply---------

let offerDetails = {
    offerName: "",
    discount: 0,
    offerType: ' ',
  };

  if(offerProducts){
    console.log('payment -==========offer ======'+offerProducts);
    
    async function calculateOfferDiscount(product) {
        if (product.offer && product.offer.length > 0) {
            // Get the latest offer
            const latestOfferId = product.offer[product.offer.length - 1];
            const offerDetails = await Offer.findById(latestOfferId);
            if (offerDetails && offerDetails.offerStatus) {
                return product.price * (offerDetails.discount / 100);
            }
        }
        return 0;
    }
    let totalDiscount = 0;
    for (const item of offerProducts) {
        const discount = await calculateOfferDiscount(item.products);
        totalDiscount += discount * item.quantity;
    }

    offerDetails ={
        offerName:offerDetails.offerName,
        discount: totalDiscount,
        offerType: offerDetails.offerType,
    }

    grandTotal -=totalDiscount;
  }
    

//----------------coupon appply --------------------

    let couponDetails = {
        code: "",
        discount: 0,
        miniPurchaseAmt: 0,
        maxredeemableAmt: 0
      };

    if(couponId){
        const coupon = await Coupon.findOne({_id:couponId});
        console.log('coupon'+coupon);
        if(!coupon && coupon.couponStatus == false){
            return res.status(400).json({ success: false, message: 'Coupon is not valid' });
  
        }
        const shippingCharge = 100;
        let grandTotal = cartTotal + shippingCharge;
        const discountAmount = cartTotal * (coupon.discount / 100);
      const couponDiscount = Math.min(
            discountAmount,
            coupon.maxredeemableAmt || coupon.maxredeemableAmt
      );

      couponDetails ={
        code:coupon.code,
        discount:couponDiscount,
        miniParchaseAmt:coupon.miniParchaseAmt,
        maxredeemableAmt:coupon.maxredeemableAmt
      };

      grandTotal -=couponDiscount;
    }

//----------save to order schema -----------------

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

    const { firstName, address, landmark, city, phone, pincode, email, paymentMethod } = req.body;

    const order = new Order({
        user: userId,
        orderItem: orderItems,
        address: {
            userName: firstName,
            address: address,
            phone: phone,
            landmark: landmark,
            city: city,
            pincode: pincode,
            email: email
        },
        offerDetails:offerDetails,
        couponDetails:couponDetails,
        totalPrice:grandTotal,
        paymentMethod: paymentMethod,
        orderStatus: "Processing",
    });


    await order.save();

    // res.status(200);
    res.redirect(`/tracking-order?orderId=${order._id}`);

});

//----------------------------MY Order page rendering-----------------------------------

const myOrderLoad = asyncHandler(async (req, res) => {
    try {
        const userId = req.query.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = await Order.find({ user : userId }).populate('user');
        console.log('orders========', order);
        const cart = await Cart.findOne({ user : userId});
        let cartCount = 0;
        if (cart) {
            cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
        }
        res.render('orders', { user, order,cartCount });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



//----------------------------------whishlist---------------------------------------

const wishlistLoad = asyncHandler(async (req, res) => {
    const userId = req.query.id;
    console.log('userId' + userId);
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId });

    let cartCount=0;
     if (cart) {
      cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
     }
    const wishlist = await Whishlist.find({ user: userId }).populate('wishlistItem.products');
    
    if (!wishlist || wishlist.length === 0) {

        res.render('wishlist', { user, wishlistItems: [], total: 0, count: 0, wishlist,cartCount });
        return;
    }
  
    // console.log('user'+user);
    res.render('wishlist', { user, wishlist, cartCount });
});


// -------------------------add wishlist-----------------------------

const wishlistProduct = asyncHandler(async (req, res) => {
    const userId = req.session.userData_id;
    const productId = req.query.id;
    console.log('ProductId==' + productId);
    let wishlist = await Whishlist.findOne({ user: userId });

    if (!wishlist) {
        wishlist = new Whishlist({ user: userId, wishlistItem: [{ products: productId }] });
    }
    const existingItem = wishlist.wishlistItem.find(item => item.products.toString() === productId);
    if (existingItem) {
        res.status(200).json({ exist: 'product exist' });
    } else {
        wishlist.wishlistItem.push({ products: productId, quantity: 1 });
    }

    const addProduct = await wishlist.save();

     if(addProduct){
      res.status(200).json({success:'success'});
     }

    res.status(200).json({ message: 'Product added to wishlist successfully' });
});


//------------------------remove from wishlist --------------------------------------------

const removeProduct = asyncHandler(async (req, res) => {
    const productId = req.body.productId;
    const userId = req.body.userId;

    let wishlist = await Whishlist.findOne({ user: userId });

    if (!wishlist) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const index = wishlist.wishlistItem.findIndex(item => item.products.toString() === productId);

    if (index !== -1) {
        wishlist.wishlistItem.splice(index, 1);
        await wishlist.save();
        res.sendStatus(200);
    } else {
        res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }
});

//------------------------------order traking page------------------------

const trakingPageLoad = asyncHandler(async (req, res) => {
    const orderId = req.query.orderId;
    const discountedTotal = req.session.total;
    console.log('orderID -======' + orderId);

    if (!orderId) {
        return res.status(400).send('Order ID is required');
    }

    const order = await Order.findById(orderId)
    // console.log('Order=====>' + order);

    if (!order) {
        return res.status(404).send('Order not found');
    }
    // Render the tracking order page with order details
    res.render('tracking-order', { order,discountedTotal });
});



//---------------cancel and return the Order ----------------------------

const updateOrder = asyncHandler(async (req, res) => {

    const { orderId, newStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        console.error(`Order with ID ${orderId} not found.`);
        return res.status(404).json({ message: 'Order not found' });
    }

    if (newStatus === 'Cancelled' || newStatus === 'Return requested') {
        // Update quantity for each product in the order
        for (let item of order.orderItem) {
            const product = await Product.findById(item.productId);
            if (!product) {
                console.error(`Product with ID ${item.productId} not found.`);
                continue;
            }
            product.quantity += item.quantity;
            await product.save();
            console.log(`Updated quantity for product ${item.productId}: new quantity is ${product.quantity}`);
        }

        const message = newStatus === 'Cancelled'
            ? `Order ${order._id} has been cancelled.`
            : `Order ${order._id} has been requested for return.`;

        const notification = new Notification({ message });
        await notification.save();

        
    //calculate refund amount if order is returned
        let refundAmount = 0;

        if(newStatus ==='Return requested' || newStatus === 'Cancelled' ){
            for(let item of order.orderItem){
                const product = await Product.findById(item.productId).populate('offer');
                const order = await Order.findById(orderId);
                if(product){
                    
                  const discount = order.offerDetails.discount || order.couponDetails.discount ;
                    refundAmount = order.totalPrice + discount ;

                  console.log('product.offer.discount==='+discount);
                  console.log('refundAmount =='+refundAmount );
                }
            }

        await Wallet.findOneAndUpdate(
            {userId:req.session.userData_id},
               {
                  $inc:{walletAmount:refundAmount},
                  $push:{
            transaction:{
                        amount:refundAmount,
                        PaymentType:'Refund',
                        date: new Date()
                        }} 
                 },
                 { upsert: true }
                )
         console.log(`Updated wallet for user ${order.user}: new balance is ${Wallet.walletAmount}`);
               
        }

    }

    order.orderStatus = newStatus;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully' });
});


//---------------------------Cancel Order --------------------------------------

const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId , newStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        console.error(`Order with ID ${orderId} not found.`);
        return res.status(404).json({ message: 'Order not found' });
    }

    // Update quantity for each product in the order
    for (let item of order.orderItem) {
        const product = await Product.findById(item.productId);
        if (!product) {
            console.error(`Product with ID ${item.productId} not found.`);
            continue;
        }
        product.quantity += item.quantity;
        await product.save();
        console.log(`Updated quantity for product ${item.productId}: new quantity is ${product.quantity}`);
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    if(newStatus === 'Cancelled' ){
        for(let item of order.orderItem){
            const product = await Product.findById(item.productId).populate('offer');
            const order = await Order.findById(orderId);
            if(product){
                
              const discount = order.offerDetails.discount || order.couponDetails.discount ;
                refundAmount = order.totalPrice + discount ;

              console.log('product.offer.discount==='+discount);
              console.log('refundAmount =='+refundAmount );
            }
        }

    await Wallet.findOneAndUpdate(
        {userId:req.session.userData_id},
           {
              $inc:{walletAmount:refundAmount},
              $push:{
        transaction:{
                    amount:refundAmount,
                    PaymentType:'Credit',
                    date: new Date()
                    }} 
             },
             { upsert: true }
            )
    const notification = new Notification({
        message: `Order ${order._id} has been cancelled.`,
    });

    await notification.save();

    res.status(200).json({ message: 'Order cancelled and quantity updated successfully' });
}});


//-------------------------------wallet rendering --------------------------------------------------------------

const walletPage  = asyncHandler(async(req,res)=>{
     
    const userId = req.query.id;
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId });
    const wallet = await Wallet.findOne({userId:userId} );
    let cartCount=0;
     if (cart) {
      cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
     }
  console.log('wallet==='+wallet);

    res.render('wallet',{user,cartCount,wallet});

});


//--------------------------------parchasing product - using wallet amount -------------

const walletParchase = asyncHandler(async(req,res)=>{

        // const discounttotal = req.session.totalDiscount;
        const offerProducts = req.session.offerProducts ;
       
        const couponId = req.session.couponId;
        const cartTotal = req.session.total;
    
        const {userId, firstName, address, landmark, city, phone, pincode, email, paymentMethod } = req.body
    

        const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');
    
        if (!cart) {
            res.status(400).json({ error: "Cart not found!" });
            return;
        }
    
        // Update stock and clear cart
        await Promise.all(cart.cartItem.map(async (item) => {
            await Product.updateOne({ _id: item.products._id }, { $inc: { quantity: -item.quantity } });
        }));
    
        await Cart.updateOne({ user: userId }, { $set: { cartItem: [] } });
    
        const shippingCharge = 100;
        grandTotal = cartTotal + shippingCharge;
    
    
        const wallet = await Wallet.findOne({userId:userId});
        let walletAmount = wallet.walletAmount;

         if(walletAmount  < grandTotal){
           res.status(400).json({message:'wallet have no efficiant money for purchase '})
         }else{
            walletAmount -= grandTotal;

           await Wallet.updateOne({ userId: userId }, {
                 walletAmount: walletAmount,
        $push: {
            transaction: {
                amount: grandTotal,
                PaymentType: 'Debit',
                date: new Date()
            }
        }
    });
         }


    //-------------------offer apply --------------
    
    let offerDetails = {
        offerName: "",
        discount: 0,
        offerType: ' ',
      };
    
      if(offerProducts){
         
          console.log('payment -==========offer ======'+offerProducts);
        // const offerProducts = cart.cartItem.filter(item => item.products.offer && item.products.offer.length > 0);   
    
        
        async function calculateOfferDiscount(product) {
            if (product.offer && product.offer.length > 0) {
                // Get the latest offer
                const latestOfferId = product.offer[product.offer.length - 1];
                const offerDetails = await Offer.findById(latestOfferId);
                if (offerDetails && offerDetails.offerStatus) {
                    return product.price * (offerDetails.discount / 100);
                }
            }
            return 0;
        }
        let totalDiscount = 0;
        for (const item of offerProducts) {
            const discount = await calculateOfferDiscount(item.products);
            totalDiscount += discount * item.quantity;
        }
    
        offerDetails ={
            offerName:offerDetails.offerName,
            discount: totalDiscount,
            offerType: offerDetails.offerType,
        }
    
        grandTotal -=totalDiscount;
      }
        
     //----------------coupon appply--------------------------
    
     let couponDetails = {
        code: "",
        discount: 0,
        miniPurchaseAmt: 0,
        maxredeemableAmt: 0
      };
    
     if(couponId){
         const coupon = await Coupon.findOne({_id:couponId });
        //  console.log('coupon'+coupon);
         if(!coupon ){
             return res.status(400).json({ success: false, message: 'Coupon is not valid' });
    
         }
         const shippingCharge = 100;
         let grandTotal = cartTotal + shippingCharge;
        //  console.log('first grandTotal'+grandTotal);
         const discountAmount = cartTotal * (coupon.discount / 100);
       const couponDiscount = Math.min(
             discountAmount,
             coupon.maxredeemableAmt || coupon.maxredeemableAmt
       );
    
       couponDetails ={
         code:coupon.code,
         discount:couponDiscount,
         miniParchaseAmt:coupon.miniParchaseAmt,
         maxredeemableAmt:coupon.maxredeemableAmt
       }
    
       grandTotal -=couponDiscount;
     }
    
    console.log('grandTotal'+grandTotal);
    
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
    
        const order = new Order({
            user: userId,
            orderItem: orderItems,
            address: {
                userName: firstName,
                address: address,
                phone: phone,
                landmark: landmark,
                city: city,
                pincode: pincode,
                email: email
            }, 
            offerDetails:offerDetails,
            totalPrice:grandTotal,
            couponDetails:couponDetails,
            paymentMethod: paymentMethod,
            orderStatus: "Processing",
        });
    
        const orderData = await order.save();
    
        // Log the order data for debugging
        console.log('OrderData:', orderData);
    
        res.status(200).json({ success: true, orderId: orderData._id });
    
    
})



//--------------------------------------------------------------------------------------------------------------

module.exports = {
    checkoutPageLoad,
    getAddress,
    checkoutSubmit,
    wishlistLoad,
    myOrderLoad,
    wishlistProduct,
    removeProduct,
    createOrder,
    verifyPayment,
    trakingPageLoad,
    updateOrder,
    cancelOrder,
    walletPage,
    walletParchase
}