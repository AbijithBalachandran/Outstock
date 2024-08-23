const asyncHandler = require('express-async-handler');
const Offer = require('../Models/offer');
const Prodcut = require('../Models/products');
const Category = require('../Models/category');
const mongoose = require('mongoose')


//-------------------Offer Management Page Load -----------------------

const offerManagement = asyncHandler(async(req,res)=>{
      
          const FirstPage = 4;
          const currentPage = parseInt(req.query.page) || 1;

          const start = (currentPage - 1) * FirstPage;

        //   const offerData = await Offer.find({}).skip(start).limit(FirstPage);

        const [offerData, offerCount] = await Promise.all([
            Offer.find({})
                .populate('selectedItems.categories')
                .populate('selectedItems.products')
                .skip(start)
                .limit(FirstPage),
            Offer.countDocuments({})
        ]);

        //   const offerCount = await Offer.countDocuments({}); 
          const totalPages = Math.ceil(offerCount / FirstPage);

        const offer = await Offer.find({});
        res.render('offerManagement',{offer:offerData, currentPage, totalPages ,ActivePage: 'offerManagement'});
});

//-------------------------------------- Add New Offer  Page------------------------------

const addNewOfferPage =  asyncHandler(async(req,res)=>{
      const products = await Prodcut.find({});
      const categories = await Category.find({});
      res.render('addOffer',{ActivePage: 'offerManagement',products,categories});
});


//---------------------------------------Edit Offers page -------------------------------

const editOfferPage = asyncHandler(async (req, res) => {
    try {
        const offer_id = req.query.id;

        if (!offer_id|| !mongoose.Types.ObjectId.isValid(offer_id)) { 
            return res.status(404).redirect('/admin/404')
           }

        const offer = await Offer.findById(offer_id);
        
        if(offer== undefined){
            return res.status(404).redirect('/admin/404')
          }
        // Initialize selectedItems properly
        let selectedItems = [];

        if (offer.offerType) {
            selectedItems = offer.selectedItems ? offer.selectedItems.products : offer.selectedItems.categories;
        }
        
        // Fetch products and categories
        const products = await Prodcut.find({});
        const categories = await Category.find({});
        
        // Render the page with the fetched data
        res.render('editOffer', { offer, ActivePage: 'offerManagement', products, categories, selectedItems });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


//--------------------Edit and Update the offers ---------------------
 

const editOffer = asyncHandler(async (req, res) => {
    const { offerName, offerType, discount, expiryDate, selectedItems, id } = req.body;

      if (!offerName || !offerType || !discount || !expiryDate || !selectedItems) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      if (discount < 0 || discount > 99) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 99' });
    }

    const offer = await Offer.findOne({ _id: id });
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

    if (offer.offerType === 'Category Base' && offer.selectedItems.categories.length > 0) {
        await Prodcut.updateMany({ category: { $in: offer.selectedItems.categories } }, { $unset: { offer: '' } });
    } else if (offer.offerType === 'Product Base' && offer.selectedItems.products.length > 0) {
        await Prodcut.updateMany({ _id: { $in: offer.selectedItems.products } }, { $unset: { offer: '' } });
    }

    offer.offerName = offerName;
    offer.offerType = offerType;
    offer.discount = discount;
    offer.expDate = expiryDate;
    offer.selectedItems = selectedItems;

    await offer.save();

    if (offerType === 'Category Base') {
        await Prodcut.updateMany({ category: { $in: selectedItems.categories } }, { $set: { offer: offer._id } });
    } else if (offerType === 'Product Base') {
        await Prodcut.updateMany({ _id: { $in: selectedItems.products } }, { $set: { offer: offer._id } });
    }

    res.status(200).json({ message: 'Offer applied successfully' });
});



//-----------------------------------Offer Activating And Deactivating ------------------------

const OfferActiveandDeactivate = asyncHandler(async (req, res) => {
    const id = req.query.offerId;
    const offer = await Offer.findById(id);

    if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
    }

    // Ensure that all products have 'offer' initialized as an array
    await Prodcut.updateMany(
        { offer: { $exists: true, $eq: null } },
        { $set: { offer: [] } }
    );

    // Toggle the offer status
    offer.offerStatus = !offer.offerStatus;
    await offer.save();

    if (offer.offerStatus) {
        if (offer.offerType === 'Product Base') {
            await Prodcut.updateMany(
                { _id: { $in: offer.selectedItems.products } },
                { $addToSet: { offer: offer._id } }
            );
        } else if (offer.offerType === 'Category Base') {
            await Prodcut.updateMany(
                { category: { $in: offer.selectedItems.categories } },
                { $addToSet: { offer: offer._id } }
            );
        }
    } else {
        await Prodcut.updateMany(
            { offer: offer._id },
            { $pull: { offer: offer._id } }
        );
    }

    const message = offer.offerStatus ? 'Offer activated successfully' : 'Offer deactivated successfully';
    res.status(200).json({ message });
});



//------------------------Apply Offer ---------------------------------------------------------------


const applyOffer = asyncHandler(async (req, res) => {
    const { offerName, offerType, discount, expiryDate, selectedItems } = req.body;

    // Check if all required fields are provided
    if (!offerName || !offerType || !discount || !expiryDate || !selectedItems) {
        return res.status(400).json({ message: 'All fields are required' });
    }

     // Validate discount percentage (must be between 0 and 99)
     if (discount < 0 || discount > 99) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 99' });
    }

    const existingOffer = await Offer.findOne({offerName:{$regex: new RegExp(`^${offerName}$`, 'i')}});

    if (existingOffer) {
        return res.status(400).json({message:'Offer Already exists'})
    }

    // Convert expiryDate from string to Date object
    const expiryDateObject = new Date(expiryDate);

    // Check if the expiry date is in the past
    if (expiryDateObject < new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
    }

    // Create and save the offer
    const offer = new Offer({
        offerName,
        offerType,
        discount,
        offerStatus: true,
        expDate: expiryDateObject,
        selectedItems:selectedItems
    });

    await offer.save();

    // Update products based on offer type
    if (offerType === 'Category Base') {
        const productsToUpdate = await Prodcut.find({ category: { $in: selectedItems.categories } });

        const updatePromises = productsToUpdate.map(product =>
            Prodcut.findByIdAndUpdate(product._id, { $set: { offer: offer._id } })
        );
        await Promise.all(updatePromises);

    } else if (offerType === 'Product Base') {
        await Prodcut.updateMany({ _id: { $in: selectedItems.products } }, { $set: { offer: offer._id } });
    }

    res.status(200).json({ success: true, message: 'Offer applied successfully' });
});


//----------------------------------------------------------------------------------------------------------------------------------------
module.exports={
      offerManagement,
      addNewOfferPage,
      editOfferPage,
      editOffer,
      OfferActiveandDeactivate,
      applyOffer
}