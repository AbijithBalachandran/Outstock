const asyncHandler = require('express-async-handler');
const Products = require('../Models/products');
const { default: mongoose } = require('mongoose');
const categories = require('../Models/category')
const Offer = require('../Models/offer');
//---------------------product detail page rendering------------------------


const productManagementLoad = asyncHandler(async (req, res) => {
    const FirstPage = 8;
    const currentPage = parseInt(req.query.page) || 1;
    const start = (currentPage - 1) * FirstPage;

    const productData = await Products.find({}).populate('category').sort({ createdAt: -1 }).skip(start).limit(FirstPage);
    const products = await Products.countDocuments({});
    const totalPages = Math.ceil(products / FirstPage);

    const offers = await Offer.find({ offerStatus: true }).populate('selectedItems.categories');

    const productDiscount = new Map();

    // Iterate over each offer
    offers.forEach(offer => {
        // Check if offer is applied to specific products
        offer.selectedItems.products.forEach(product => {
            productDiscount.set(product._id.toString(), offer.discount);
        });

        // Check if offer is applied to categories
        offer.selectedItems.categories.forEach(category => {
            productData.forEach(product => {
                if (product.category && product.category._id.toString() === category._id.toString()) {
                    // If the product's category matches the offer's category, apply the discount
                    productDiscount.set(product._id.toString(), offer.discount);
                }
            });
        });
    });

    res.render('productManagement', { product: productData, currentPage, totalPages, ActivePage: 'productManagement', productDiscount });
});



//------------------- Add product page rendering---------------------------- 

const addProductLoad = asyncHandler(async(req,res)=>{
    const category = await categories.find({}); 
      res.render('addProducts',{category,ActivePage: 'productManagement' });
})


//--------------------------------------Add Product------------------------
   
const addNewproduct = asyncHandler(async(req,res)=>{
       try{
           let {name,action,description,price,discount,disPrice,category,quantity,type} = req.body
           const categoryDoc = await categories.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });

        if (!categoryDoc) {
            return res.status(400).json({message: 'Category not found'});
        }
    
        // Check for existing Product excluding the current one
        const existingProduct = await Products.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingProduct ) {
            return res.status(400).json({ success: false, message: 'This Product already exists.' });
        }


        const categoryId = categoryDoc._id;

           const images = req.files.map(file => file.filename);

           const product =  await Products.findOne({name}).populate('category');
            
                if(action == 'list'){
                 action = false;
                }
                else if(action == 'unlist'){
                 action = true;
                }


     // Initialize updated discount and offer details
        let updatedDiscount = 0;
        let updatedDisPrice = price;
        let appliedOffer = null;

        // Fetch applicable category-based offers
        const currentDate = new Date();
        const applicableOffers = await Offer.find({
            offerType: "Category Base",
            offerStatus: true,
            expDate: { $gt: currentDate },
            'selectedItems.categories': categoryId
        }).sort({ discount: -1 }); // Sort by highest discount

        if (applicableOffers && applicableOffers.length > 0) {
            // Apply the offer with the highest discount
            appliedOffer = applicableOffers[0];
            updatedDiscount = appliedOffer.discount;
            updatedDisPrice = price - (price * (updatedDiscount / 100));
            updatedDisPrice = parseFloat(updatedDisPrice.toFixed(2)); // Round to 2 decimal places
        } else {
            // If no offer, check if manual discount is provided
            if (discount && discount > 0) {
                updatedDiscount = discount;
                updatedDisPrice = price - (price * (updatedDiscount / 100));
                updatedDisPrice = parseFloat(updatedDisPrice.toFixed(2));
            }
        }


            const newproduct = new Products ({
                name:name,
                action:action,
                description:description,
                price:price,
                discount:discount,
                disPrice:disPrice,
                category:categoryId,
                images:images,
                quantity:quantity,
                type:type,
                offer: appliedOffer ? appliedOffer._id : null,
                createdAt:new Date()
            });

                 const productData = await newproduct.save();
                 console.log(productData)

                if (newproduct.action ==='list') {
                 newproduct.is_Delete = false;
                 await newproduct.save();
                }

                 res.sendStatus(200);

                } catch (error) {
                    console.error('Error:', error);
                    return res.status(500).json({ message: 'An unexpected error occurred' });
                }

}); 

//-----------------------------edit  Product  page rendering -----------------------

const editProductLoad = asyncHandler(async(req,res)=>{
      const id = req.query.productId;

      if (!id  || !mongoose.Types.ObjectId.isValid(id )) { 
        return res.status(404).redirect('/admin/404')
       }
    
      const category = await categories.find({});
      const product = await Products.findById({_id:id}).populate('category');
                  // console.log('prodict------------------------'+products);
       if(product){
            res.render('editProduct',{product,category,ActivePage: 'productManagement' });
       }else{
            res.redirect('/admin/procductManagement');
       }

    });

//----------------------------------------------edit product -----------------------------------------------------

const editAndUpdateProduct = asyncHandler(async (req, res) => {
    const {name,action,description,price,discount,category,quantity,type,id} = req.body;

    try {
        // Validate and find the category
        const categoryDoc = await categories.findOne({
            name: { $regex: new RegExp(`^${category}$`, 'i') }
        });

        if (!categoryDoc) {
            return res.status(400).json({ success: false, message: 'Category not found' });
        }

        const categoryId = categoryDoc._id;

        // Check for existing product with the same name (excluding current product)
        const existingProduct = await Products.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingProduct) {
            return res.status(400).json({ success: false, message: 'This product already exists' });
        }

        // Find the product to update
        const productToUpdate = await Products.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Handle image updates
        const newImages = req.files ? req.files.map(file => file.filename) : [];
        let updatedImages = [...productToUpdate.images];

        // Replace existing images with new images if provided
        for (let i = 0; i < newImages.length; i++) {
           updatedImages[i] = newImages[i];
          }
            

        // Initialize updated discount and offer details
        let updatedDiscount = 0;
        let updatedDisPrice = price;
        let appliedOffer = null;

        // Fetch applicable category-based offers
        const currentDate = new Date();
        const applicableOffers = await Offer.find({
            offerType: "Category Base",
            offerStatus: true,
            expDate: { $gt: currentDate },
            'selectedItems.categories': categoryId
        }).sort({ discount: -1 }); // Sort by highest discount

        if (applicableOffers && applicableOffers.length > 0) {
            // Apply the offer with the highest discount
            appliedOffer = applicableOffers[0];
            updatedDiscount = appliedOffer.discount;
            updatedDisPrice = price - (price * (updatedDiscount / 100));
            updatedDisPrice = parseFloat(updatedDisPrice.toFixed(2)); // Round to 2 decimal places
        } else {
            // If no offer, check if manual discount is provided
            if (discount && discount > 0) {
                updatedDiscount = discount;
                updatedDisPrice = price - (price * (updatedDiscount / 100));
                updatedDisPrice = parseFloat(updatedDisPrice.toFixed(2));
            }
        }

        // Prepare the update object
        const updateData = {
            name,
            action,
            description,
            price,
            discount: updatedDiscount,
            disPrice: updatedDisPrice,
            category: categoryId,
            images: updatedImages,
            quantity,
            type,
            offer: appliedOffer ? appliedOffer._id : null
        };

        // Update the product
        await Products.findByIdAndUpdate(id, updateData, { new: true });

        console.log("Product updated successfully");
        res.json({ success: true, message: 'Product updated successfully' });

    } catch (error) {
        console.error('Error occurred in editAndUpdateProduct:', error);
        res.status(500).json({ success: false, message: 'An unexpected error occurred' });
    }
});


 
 //---------------------------------------------update Product Status ----------------------------------------------------------
 

    const updateProductStatus = asyncHandler(async(req,res)=>{

      const id = req.query.productId;

      if (!id  || !mongoose.Types.ObjectId.isValid(id )) { 
        return res.status(404).redirect('/admin/404')
       }

      const productInfo = await Products.findById({_id:id});

              productInfo.action = !productInfo.action;
              await productInfo.save();
        
  let message = productInfo.action ? "User list successfully" : "User Unlist successfully";

       res.status(200).json({ message });
 });

 //------------------------------delete Product ----------------------------------------------------------------------------

 const deleteProduct = asyncHandler(async(req,res)=>{

            const id = req.query.productId;
            if (!id  || !mongoose.Types.ObjectId.isValid(id )) { 
                return res.status(404).redirect('/admin/404')
               }

           await Products.deleteOne({ _id:id });
            res.redirect('/admin/productManagement');
 
});

//-----------------------------------------------search product ----------------------------------------------

const searchProduct = asyncHandler(async(req,res)=>{
     let product=[];
     const currentPage=parseInt(req.query.page)||1;
     const FirstPage = 8;
     const start = (currentPage-1) * FirstPage;
     const products = await Products.countDocuments();
     const totalPages = Math.ceil(product / FirstPage);

     const searchQuery = req.query.search || '';

       const productData ={
           $or:[{name :{$regex:searchQuery,$options:'i'}},
              {category:{$regex:searchQuery,$options:'i'}},
           ] 
       } 
       if( req.query.search ){
            product = await Products.find(productData).skip(start).limit(FirstPage);
       }else{
            product = await Products.find().skip(start).limit(FirstPage);
       }

       res.render('productManagement',{product,currentPage,totalPages, ActivePage: 'productManagement' });
});


//-------------------------------------------------------------------------------------------



module.exports ={
      productManagementLoad,
      addProductLoad,
      editProductLoad,
      updateProductStatus,
      addNewproduct,
      deleteProduct,
      searchProduct,
      editAndUpdateProduct 

}