const asyncHandler = require('express-async-handler');
const Coupon = require('../Models/coupon');
const { logOut } = require('./adminController');
const { findOne } = require('../Models/cart');
const mongoose = require('mongoose')
const Cart = require('../Models/cart');

//------------------couponManagement Page Load---------------

const couponManagementLoad = asyncHandler(async(req,res)=>{

      const FirstPage = 3;
      const currentPage = parseInt(req.query.page) || 1;

      const start = (currentPage - 1) * FirstPage;

      const couponData = await Coupon.find({}).skip(start).limit(FirstPage);
      const couponCount = await Coupon.countDocuments({}); 
      const totalPages = Math.ceil(couponCount / FirstPage);

      
      res.render('couponManagement',{coupon:couponData, currentPage, totalPages ,ActivePage: 'couponManagement'});
});



//-------------------addcoupon page Load -----------------------

const addCouponPage = asyncHandler(async(req,res)=>{
          res.render('addcoupon',{ActivePage: 'couponManagement' })
});

//---------------------Adding New Prodcut ------------------------

const addNewCoupon = asyncHandler(async (req, res) => {
      
      const { codeNumber, discount, minPurchaseAmount, maxRedeemableAmount, expiryDate } = req.body;
  
      const existingCoupon = await Coupon.findOne({ code: { $regex: new RegExp(`^${codeNumber}$`, 'i') } });
    
      if (existingCoupon) {
          return res.status(400).json({ message: 'Coupon already exists' });
      }
  
      const newCoupon = new Coupon({
          code: codeNumber,
          discount: discount,
          miniParchaseAmt: minPurchaseAmount,
          maxredeemableAmt: maxRedeemableAmount,
          expDate: expiryDate,
          couponStatus: true, 
          createdAt: Date.now()
      });
  
      await newCoupon.save();
  
      res.status(200).json({ message: 'Coupon added successfully' });
  });
  
  
//-------------------EditCoupon Page Load -------------------------

const editCouponPage = asyncHandler(async(req,res)=>{
      const coupon_id = req.query.id;

      if (!coupon_id || !mongoose.Types.ObjectId.isValid(coupon_id)) { 
            return res.status(404).redirect('/admin/404')
           }
      const coupon = await Coupon.findById({_id:coupon_id});
      if(coupon== undefined){
            return res.status(404).redirect('/admin/404')
          }

      res.render('editcoupon',{coupon,ActivePage: 'couponManagement' });
});

//---------------------Edit The Coupons ----------------------------------

const editCoupons = asyncHandler(async(req,res)=>{
      const { codeNumber, discount, minPurchaseAmount, maxRedeemableAmount, expiryDate,id } = req.body;

      const coupon = await Coupon.findById(id);

  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }

              const existingCoupon = await Coupon.findOne({ 
            code: { $regex: new RegExp(`^${codeNumber}$`, 'i') },
            _id: { $ne: id }
          });
    
      if (existingCoupon) {
          return res.status(400).json({coupon,message: 'Coupon already exists' });
      }

       // Update the coupon
  coupon.code = codeNumber;
  coupon.discount = discount;
  coupon.miniParchaseAmt = minPurchaseAmount;
  coupon.maxredeemableAmt = maxRedeemableAmount;
  coupon.expDate = expiryDate;

  await coupon.save();

  res.sendStatus(200)
      
});
      
//----------------------------Update the coupon status to list and unlist --------------------

const updateCouponStatus =asyncHandler(async(req,res)=>{
      const id = req.query.couponId;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) { 
            return res.status(404).redirect('/admin/404')
           }

      const coupon = await Coupon.findById({_id:id});

      coupon.couponStatus = !coupon.couponStatus ;
      await coupon.save();
     
      let message = !coupon.couponStatus?"coupon list successfully ":"coupon Unlist successfully";

      res.status(200).json({message});
})
//----------------------------------------delete Coupon ----------------------------------

const deleteCoupon = asyncHandler(async(req,res)=>{
      const id = req.query.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) { 
            return res.status(404).redirect('/admin/404')
           }
      await Coupon.deleteOne({_id:id});
      res.redirect('/admin/couponManagement');
})
//------------------------------------Apply Coupon------------------------------------------

const applyCoupon = asyncHandler(async (req, res) => {

      const offerDiscount = req.session.totalDiscount;
      const offerProducts = req.session.offerProducts;

      const { couponCode, total } = req.body;
      if (!couponCode) {
            
          return res.status(400).json({ message: 'Coupon code is required.' });
      }
      const couponData = await Coupon.findOne({ code: couponCode });
  
      if (!couponData) {
          return res.status(400).json({ message: 'Invalid coupon code.' });
      }
  
      if (total < couponData.miniParchaseAmt) {
            console.log('total < couponData.miniParchaseAmt');
          return res.status(400).json({
              message: `This coupon is only valid for purchases of ₹${couponData.miniParchaseAmt} or more.`
          });
      }
   
      // console.log('couponData.discount',couponData.discount);
      
      const discountAmount = total * (couponData.discount / 100);

      const couponDiscount = Math.min(
            discountAmount,
            couponData.maxredeemableAmt || couponData.maxredeemableAmt
      ); 
      const shippingCharge = 100;
      let discountedTotal = total - couponDiscount + shippingCharge;

      if (offerProducts) {
            discountedTotal = total - offerDiscount- couponDiscount + shippingCharge
      }
      
      req.session.coupon = couponData.discount;
      req.session.couponId = couponData._id;
      req.session.coupontotal = discountedTotal;

      res.status(200).json({ discountedTotal,couponDiscount });
  });


//------------------------------------------------------------------------------------------

module.exports ={
      addCouponPage,
      couponManagementLoad,
      editCouponPage,
      addNewCoupon,
      editCoupons,
      updateCouponStatus,
      deleteCoupon,
      applyCoupon
}