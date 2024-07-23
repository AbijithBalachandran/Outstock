const asyncHandler = require('express-async-handler');
const Offer = require('../Models/offer');
const Prodcut = require('../Models/products');
const Category = require('../Models/category');



//-------------------Offer Management Page Load -----------------------

const offerManagement = asyncHandler(async(req,res)=>{
      
        const offer = await Offer.find({});
        res.render('offerManagement',{offer,ActivePage: 'offerManagement'});
});

//--------------------Add New Offer  Page------------------------------

const addNewOfferPage =  asyncHandler(async(req,res)=>{
      const products = await Prodcut.find({});
      const categories = await Category.find({});
      res.render('addOffer',{ActivePage: 'offerManagement',products,categories});
});


//--------------------Edit Offers page -------------------------------

const editOfferPage = asyncHandler(async(req,res)=>{
    const offer_id = req.query.id ;
    const offer = await Offer.findById(offer_id);
    const products = await Prodcut.find({});
      const categories = await Category.find({});
     res.render('editOffer',{offer,ActivePage: 'offerManagement',products,categories});

});

//--------------------Edit and Update the offers ---------------------


const editOffer = asyncHandler(async (req, res) => {
      const { offerName, offerType, discount, expiryDate, selectedItems, id } = req.body;
          
      // Debugging output
      console.log('Received data:', req.body);
  
      // if (!offerName || !offerType || !offerDiscount || !expiryDate || !selectedItems) {
      //     return res.status(400).json({ message: 'All fields are required' });
      // }
  
      const offer = await Offer.findOne({_id:id});
      console.log('offer==='+offer);
      if (!offer) {
          return res.status(404).json({ message: 'Offer Not Found' });
      }
  
      const existOffer = await Offer.findOne({
          offerName: { $regex: new RegExp(`^${offerName}$`, 'i') },
          _id: { $ne: id }
      });
  
      if (existOffer) {
          return res.status(400).json({ message: 'Offer Already exists' });
      }
  
      offer.offerName = offerName;
      offer.offerType = offerType;
      offer.discount = discount;
      offer.expDate = expiryDate;
  
      await offer.save();
  
      if (offerType === 'Category Base') {
          const productsToUpdate = await Prodcut.find({ category: { $in: selectedItems.categories } });
          const updatePromises = productsToUpdate.map(product =>
              Prodcut.findByIdAndUpdate(product._id, { $set: { offer: offer._id } })
          );
          await Promise.all(updatePromises);
      } else if (offerType === 'Product Base') {
          await Prodcut.updateMany({ _id: { $in: selectedItems.products } }, { $set: { offer: offer._id } });
      }
  
      res.status(200).json({ message: 'Offer applied successfully' });
  });
  


//-----------------------------------Offer Activating And Deactivating ------------------------

const OfferActiveandDeactivate = asyncHandler(async(req,res)=>{

      const id = req.query.offerId;
      const offer = await Offer.findById({_id:id});

      offer.offerStatus = !offer.offerStatus ;

      await offer.save();

      if(offer.offerStatus === true ){
            await Prodcut.updateMany(
                  { offer: { $ne: offer._id } }, 
                  { $push: { offer: offer._id } })
      }else{
            await Prodcut.updateMany(
                  { offer: offer._id },
                  { $pull: { offer: offer._id } });
      }

      let message = !offer.offerStatus ? 'offer activate successfully':'offer deactivate successfully';

      res.status(200).json({message});

});

//------------------------Apply Offer ---------------------------------------------------------------

const applyOffer = asyncHandler(async (req, res) => {
    const { offerName, offerType, discount, expiryDate, selectedItems } = req.body;

    if (!offerName || !offerType || !discount || !expiryDate || !selectedItems) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const offer = new Offer({
        offerName,
        offerType,
        discount,
        offerStatus: true,
        expDate: new Date(expiryDate)
    });

    await offer.save();

    if (offerType === 'Category Base') {
      const productsToUpdate = await Prodcut.find({ category: { $in: selectedItems.categories } });

      const updatePromises = productsToUpdate.map(product =>
            Prodcut.findByIdAndUpdate(product._id, { $set: { offer: offer._id } })
      );
      await Promise.all(updatePromises);

    } else if (offerType === 'Product Base') {
        await Prodcut.updateMany({ _id: { $in: selectedItems.products } }, { $set: { offer: offer._id } });
    }

    res.status(200).json({ success:true, message: 'Offer applied successfully' });
});

//---------------------------------------------------------------------
module.exports={
      offerManagement,
      addNewOfferPage,
      editOfferPage,
      // addOffer,
      editOffer,
      OfferActiveandDeactivate,
      applyOffer
}