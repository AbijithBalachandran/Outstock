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

const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');
const mongoose = require('mongoose')


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
    const discountedTotal = req.session.coupontotal ? req.session.coupontotal : '0.00' ;

    const user = await User.findById(userId);
    const cart = await Cart.find({ user: userId }).populate('cartItem.products');
    const address = await Address.find({ user: userId });
    const coupon = await Coupon.find({});

    const shippingCharge = 100;

    if (!cart || cart.length === 0) {
        return res.render('checkout', { address, cart: [], total: 0, user, coupon ,shippingCharge,activePage:"chechout",discountedTotal});
    }

    const total = cart[0].cartItem.reduce((acc, val) => acc + val.products.price * val.quantity, 0);

    const offerProducts = cart[0].cartItem.filter(item => item.products.offer && item.products.offer.length > 0);

    req.session.offerProducts = offerProducts;

    const wallet = await Wallet.findOne({ userId: userId });
    
    async function calculateOfferDiscount(product) {
        if (product.offer && product.offer.length > 0) {
  
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
    
    let grandTotal = total + shippingCharge;
       if (offerProducts) {
        grandTotal -=totalDiscount
       }

    req.session.totalDiscount = totalDiscount;

    req.session.total =total;

    req.session.grandtotal = grandTotal;

    // Set a default walletAmount if the wallet doesn't exist
    const walletAmount = wallet ? wallet.walletAmount : 0;

    res.render('checkout', { address, cart, total, user, coupon, grandTotal, shippingCharge,couponId ,totalDiscount,offerProducts,activePage:"checkout",discountedTotal,walletAmount});
});



//------------------------------------ Create Razorpay order--------------------------------------------


const createOrder = asyncHandler(async (req, res) => {

    const offerProducts = req.session.offerProducts ;
    let discountedTotal = req.session.coupontotal;
    const couponId = req.session.couponId;
    const cartTotal = req.session.total;

    const { firstName, address, landmark, city, phone, pincode, email, paymentMethod } = req.body;
    
    console.log('creareorder');
    const { userId } = req.query;
    const cart = await Cart.findOne({ user: userId }).populate('cartItem.products');

    if (!cart || cart.cartItem.length === 0) {
        res.status(400).json({ error: "Cart is empty" });
        return;
    }

    const shippingCharge = 100;
    grandTotal = cartTotal + shippingCharge;

    const cartAmount = cart.cartItem.reduce((acc, val) => acc + (val.products.price * val.quantity), 0);
    console.log('cartAmount '+cartAmount );
    
    let amount = cartAmount + shippingCharge*100;

//-------------------offer apply --------------

let offerDetails = {
    offerName: "",
    discount: 0,
    offerType: ' ',
  };
  let totalDiscount = 0;
  if(offerProducts){

    async function calculateOfferDiscount(product) {
        if (product.offer && product.offer.length > 0) {
           
            const latestOfferId = product.offer[product.offer.length - 1];
            const offerDetails = await Offer.findById(latestOfferId);
            if (offerDetails && offerDetails.offerStatus) {
                return product.price * (offerDetails.discount / 100);
            }
        }
        return 0;
    }
    
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
    amount =grandTotal*100
  }
  
    
 //-------------------coupon appply------------------------------------

 let couponDetails = {
    code: "",
    discount: 0,
    miniPurchaseAmt: 0,
    maxredeemableAmt: 0
  };

  let couponDiscount = 0;

 if(couponId){
     const coupon = await Coupon.findOne({_id:couponId });
     if(!coupon ){
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
   }

   grandTotal -=couponDiscount;
   amount = discountedTotal* 100;
 }

   if (offerProducts&&couponId) {
    grandTotal = cartTotal-couponDiscount-totalDiscount+shippingCharge;
    amount = discountedTotal* 100;
   }

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
        totalPrice:amount/100,
        couponDetails:couponDetails,
        paymentMethod: paymentMethod,
        orderStatus: "Pending",
    });

    const orderData = await order.save();

req.session.orderId = orderData._id;
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
                orderData:orderData._id
            });

        }
        else {
            console.log(err);
        }
    });

    console.log('amount===',amount);
    
});



//-------------------------------------------------verifyPayment--------------------------------------------------------------------------------------------------------------------

const verifyPayment = asyncHandler(async (req, res) => {

    const offerProducts = req.session.offerProducts ;
   
    const couponId = req.session.couponId;
    const cartTotal = req.session.total;

    const { orderCreationId, razorpayPaymentId, razorpaySignature, userId } = req.body;


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

const orderId = req.session.orderId;
const orderData = await Order.findByIdAndUpdate(orderId, {
    $set: {
        orderStatus: "Processing",
        paymentDetails: {
            razorpayOrderId: orderCreationId,
            razorpayPaymentId: razorpayPaymentId,
            razorpaySignature: razorpaySignature,
        },
    },
}, { new: true });
    // Log the order data for debugging
    console.log('OrderData:', orderData);

    res.status(200).json({ success: true, orderId: orderData._id });
});



//------------------address showing the checkout page -------------------------------------------------------------------------------------------------------------------------------------

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
    const cartTotal = req.session.total;
   

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

    if (offerProducts&&couponId) {
        grandTotal = cartTotal-couponDiscount-totalDiscount+shippingCharge;

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

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { 
            return res.status(404).redirect('/404')
           }

        const FirstPage = 6;
        const currentPage = parseInt(req.query.page) || 1;
        const start = (currentPage - 1) * FirstPage;

        const orderData = await Order.find({user : userId }).populate('user').sort({createdAt:-1}).skip(start).limit(FirstPage);

        const orderCount = await Order.countDocuments({user: userId}); 
        const totalPages = Math.ceil(orderCount / FirstPage);
        

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const cart = await Cart.findOne({ user : userId});
        let cartCount = 0;
        if (cart) {
            cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
        }
        res.render('orders', { user, order:orderData,cartCount,currentPage, totalPages,activePage:"orders"  });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



//----------------------------------whishlist---------------------------------------

const wishlistLoad = asyncHandler(async (req, res) => {
    const userId = req.query.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).redirect('/404');
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).redirect('/404');
    }

    const cart = await Cart.findOne({ user: userId });

    let cartCount = 0;
    if (cart) {
        cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
    }

    const wishlist = await Whishlist.findOne({ user: userId }).populate('wishlistItem.products');

    if (!wishlist || wishlist.wishlistItem.length === 0) {
        res.render('wishlist', { user, wishlistItem: [], total: 0, count: 0, wishlist, cartCount, activePage: "wishlist" });
        return;
    }

    // No pagination, fetch all wishlist items
    const wishlistItems = wishlist.wishlistItem;

    res.render('wishlist', { user, wishlistItem: wishlistItems, cartCount, activePage: "wishlist" });
});




// -------------------------add wishlist-----------------------------

const wishlistProduct = asyncHandler(async (req, res) => {
    const userId = req.session.userData_id;
    const productId = req.query.id;

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

    //  if(addProduct){
    //   res.status(200).json({success:'success'});
    //  }

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
    const discountedTotal = req.session.coupontotal;
    const userId =req.session.userData_id

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) { 
        return res.status(404).redirect('/404')
       }
  
    const order = await Order.findById(orderId)
 
    if (!order) {
        return res.status(404).send('Order not found');
    }

    if(!userId){
        return res.status(400).send('User ID is required');  
    }
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send('User not found');
    }


    // Render the tracking order page with order details
    res.render('tracking-order', {user,order,discountedTotal,activePage:"tracking-order" });
});


//---------------------------------download invoice --------------------------------

const downloadInvoice = async (req, res) => {
    const orderId = req.params.orderId;

    try {
        const order = await Order.findById(orderId)
            .populate('user')
            .populate('orderItem.productId')
            .populate('orderItem.category');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const doc = new PDFDocument({ margin: 30 });
        const stream = new PassThrough();
        doc.pipe(stream);

        // Header
        doc.fontSize(16).text(`Invoice for Order ID: ${orderId}`, { underline: true, align: 'center' });
        doc.moveDown();

        // Customer details
        doc.fontSize(12).text(`Customer Name: ${order.address.userName}`);
        doc.text(`Customer Email: ${order.address.email}`);
        doc.text(`Order Date: ${new Date(order.orderDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
        doc.text(`Order Status: ${order.orderStatus}`);
        doc.moveDown();

        // Address details
        doc.text('Address Details:');
        doc.text(`Email: ${order.address.email}`);
        doc.text(`Name: ${order.address.userName}`);
        doc.text(`Phone: ${order.address.phone}`);
        doc.text(`Address: ${order.address.address}`);
        doc.text(`Landmark: ${order.address.landmark}`);
        doc.text(`Pincode: ${order.address.pincode}`);
        doc.moveDown();

        // Order items title
        doc.fontSize(12).text('Order Items:');
        doc.moveDown(0.5);

        // Define table structure
        const startX = doc.x;
        const startY = doc.y;
        const tableWidth = 550;
        const columnWidths = [300, 100, 100];
        const rowHeight = 20;

        // Table header
        doc.lineWidth(1);
        doc.rect(startX, startY, tableWidth, rowHeight).stroke();

        doc.fontSize(10).text('Product Name', startX + 5, startY + 5, { width: columnWidths[0], align: 'left' });
        doc.text('Quantity', startX + columnWidths[0] + 5, startY + 5, { width: columnWidths[1], align: 'center' });
        doc.text('Price', startX + columnWidths[0] + columnWidths[1] + 5, startY + 5, { width: columnWidths[2], align: 'right' });

        doc.moveDown(1);

        // Table rows
        let currentY = startY + rowHeight;
        order.orderItem.forEach(item => {
            doc.rect(startX, currentY, tableWidth, rowHeight).stroke();

            doc.text(item.productId.name, startX + 5, currentY + 5, { width: columnWidths[0], align: 'left' });
            doc.text(item.quantity.toString(), startX + columnWidths[0] + 5, currentY + 5, { width: columnWidths[1], align: 'center' });
            doc.text(`${item.price}`, startX + columnWidths[0] + columnWidths[1] + 5, currentY + 5, { width: columnWidths[2], align: 'right' });

            currentY += rowHeight;
        });

        if(order.offerDetails && order.couponDetails){
            doc.fontSize(10).text(`Discount: ${(order.offerDetails.discount || 0) + (order.couponDetails.discount || 0)}`, startX, currentY + 10);
        }else if (order.offerDetails) {
            doc.fontSize(10).text(`Discount: ${order.offerDetails.discount}`, startX, currentY + 10);
        } else if (order.couponDetails) {
            doc.fontSize(10).text(`Discount: ${order.couponDetails.discount}`, startX, currentY + 10);
        } else {
            doc.fontSize(10).text(`Discount: ${'00.0'}`, startX, currentY + 10);
        }
        
        doc.moveDown(2);
        doc.fontSize(12).text(`Total Price: ${order.totalPrice}`, startX, currentY + 22);

        doc.end();

        res.setHeader('Content-disposition', `attachment; filename=Invoice_${orderId}.pdf`);
        res.setHeader('Content-type', 'application/pdf');
        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).send('Internal Server Error');
        });

    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).send('Internal Server Error');
    }
};



//---------------cancel and return the Order ----------------------------


const updateOrder = asyncHandler(async (req, res) => {
    const { orderId, newStatus, returnReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        console.error(`Order with ID ${orderId} not found.`);
        return res.status(404).json({ message: 'Order not found' });
    }

    if (newStatus === 'Return requested' && !returnReason) {
        return res.status(400).json({ message: 'Return reason is required.' });
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
            : `Order ${order._id} has been requested for return due to: ${returnReason}`;

        const notification = new Notification({ message });
        await notification.save();

        // Save the return reason in the order if it's a return request
        if (newStatus === 'Return requested') {
            order.returnReason = returnReason;
        }

        // Calculate refund amount if order is returned
        let refundAmount = 0;
        if (newStatus === 'Return requested' || newStatus === 'Cancelled') {
            for (let item of order.orderItem) {
                const product = await Product.findById(item.productId).populate('offer');
                if (product) {
                    const discount = order.offerDetails.discount || order.couponDetails.discount;
                    refundAmount = order.totalPrice + discount;

                    console.log('product.offer.discount===', discount);
                    console.log('refundAmount ===', refundAmount);
                }
            }

            await Wallet.findOneAndUpdate(
                { userId: req.session.userData_id },
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

    res.status(200).json({ message: 'Order cancelled successfully' });
}});


//-------------------------------wallet rendering --------------------------------------------------------------

const walletPage = asyncHandler(async (req, res) => {
    const userId = req.query.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { 
        return res.status(404).redirect('/404');
    }

    const FirstPage = 7;
    const currentPage = parseInt(req.query.page) || 1;

    const start = (currentPage - 1) * FirstPage;

    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).send('User not found');
    }
    
    const cart = await Cart.findOne({ user: userId });
    let cartCount = 0;
    if (cart) {
        cartCount = cart.cartItem.reduce((total, item) => total + item.quantity, 0);
    }
    // Find the wallet
    const wallet = await Wallet.findOne({ userId: userId });

    if (!wallet) {
        // return res.status(404).send('Wallet not found');
        return res.render('wallet', { wallet, currentPage:0, totalPages:0, user, cartCount, activePage: "wallet" });
    }

    // Sort transactions by date in descending order
    const sortedTransactions = wallet.transaction
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const paginatedTransactions = sortedTransactions.slice(start, start + FirstPage);
    const totalPages = Math.ceil(sortedTransactions.length / FirstPage);

    res.render('wallet', { wallet: paginatedTransactions, currentPage, totalPages, user, cartCount, activePage: "wallet" });
});


//--------------------------------parchasing product - using wallet amount -------------

const walletParchase = asyncHandler(async(req,res)=>{
  
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
     let couponDiscount=0
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
       let couponDiscount = Math.min(
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


     if (offerProducts&&couponId) {
        grandTotal = cartTotal-couponDiscount-totalDiscount+shippingCharge;

       }

    
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
    
        res.status(200).json({ success: true, orderId: orderData._id });
    
    
})


//-----------------------------Failed payment to retry to pay ----------------------------------------------------------

const retryCreateOrder = asyncHandler(async (req, res) => {
    try {
        const { userId, orderId } = req.query;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { 
            return res.status(404).redirect('/404')
           }

           if (!orderId|| !mongoose.Types.ObjectId.isValid(orderId)) { 
            return res.status(404).redirect('/404')
           }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(400).json({ error: "Order not found!" });
        }


        const amount = order.totalPrice *100;

        const options = {
            amount: amount,
            currency: "INR",
            receipt: orderId,
        };

        instance.orders.create(options, (err, razorpayOrder) => {
            if (err) {
                console.error("Razorpay Order Creation Error:", err);
                return res.status(500).json({ error: "Failed to create order with Razorpay!" });
            }

            // Send the response after successfully creating the Razorpay order
            res.status(200).json({
                success: true,
                order_id: razorpayOrder.id,
                amount: amount,
                key_id: process.env.RAZORPAY_kEY_ID,
                contact: "7593925598",
                name: "Abijith",
                email: "abijith24799@gmail.com",
                savedOrderId: orderId,
            });

            // Log after sending the response to avoid ERR_HTTP_HEADERS_SENT error

        });

    } catch (error) {
        console.error("Retry Create Order Error:", error);
        res.status(500).json({ error: "Internal Server Error!" });
    }
});

//--------------------------verifying the repayment -----------------------------------------------------------------------------------------------------

const verifyRePayment = asyncHandler(async (req, res) => {
    const { orderCreationId, razorpayPaymentId, razorpaySignature, userId } = req.body;

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

    const orderId = req.query.orderId;
    console.log("Received orderId:", orderId);  // Log the received orderId

    const orderData = await Order.findByIdAndUpdate(orderId, {
        $set: {
            orderStatus: "Processing",
            paymentDetails: {
                razorpayOrderId: orderCreationId,
                razorpayPaymentId: razorpayPaymentId,
                razorpaySignature: razorpaySignature,
            },
        },
    }, { new: true });

    if (!orderData) {
        console.log("Order not found for orderId:", orderId);  // Log if order not found
        res.status(404).json({ error: "Order not found!" });
        return;
    }

    res.status(200).json({ success: true, orderId: orderData._id });
});



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
    walletParchase,
    downloadInvoice,
    retryCreateOrder,
    verifyRePayment
}