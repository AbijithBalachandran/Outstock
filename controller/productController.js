const asyncHandler = require('express-async-handler');
const Products = require('../Models/products');
const { default: mongoose } = require('mongoose');
const categories = require('../Models/category')
const Offer = require('../Models/offer');
//---------------------product detail page rendering------------------------

const productManagementLoad = asyncHandler(async(req,res)=>{
   
      const FirstPage = 8;
      const currentPage = parseInt(req.query.page) || 1;

      const start = (currentPage - 1) * FirstPage;

      const  productData = await Products.find({}).populate('category').sort({createdAt:-1}).skip(start).limit(FirstPage);
      const products = await Products.countDocuments({});

      const totalPages = Math.ceil(products / FirstPage);

      const offers = await Offer.find({offerStatus:true}).populate('selectedItems.categories');

      const productDiscount = new Map();

      offers.forEach(offer =>{
        offer.selectedItems.products.forEach(products =>{
            productDiscount.set(products._id.toString(),offer.discount);
        });
      });

      res.render('productManagement',{ product: productData, currentPage, totalPages,ActivePage: 'productManagement',productDiscount });
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
                 action = true;
                }
                else if(action == 'unlist'){
                 action = false;
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
                createdAt:new Date()
            });

                 const productData = await newproduct.save();
                 console.log(productData)

                if (newproduct.action ==='list') {
                 newproduct.is_Delete = true;
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
    const { name, action, description, price, discount, disPrice, category, quantity, type, id } = req.body;

    try {
        // Find the category
        const categoryDoc = await categories.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (!categoryDoc) {
            return res.status(400).json({ success: false, message: 'Category not found' });
        }
        const categoryId = categoryDoc._id;

        // Check if the product exists, excluding the current product being edited
        const existingProduct = await Products.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingProduct) {
            return res.status(400).json({ success: false, message: 'This product already exists' });
        }

        // Find the product being edited
        const productToUpdate = await Products.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Handle new images
        const newImages = req.files ? req.files.map(file => file.filename) : [];
        const updatedImages = [...productToUpdate.images];

        // Replace existing images with new images if new images are provided
        for (let i = 0; i < newImages.length; i++) {
            updatedImages[i] = newImages[i];
        }

        // Update the product
        await Products.findByIdAndUpdate(
            id,
            {
                $set: {
                    name: name,
                    action: action,
                    description: description,
                    price: price,
                    discount: discount,
                    disPrice: disPrice,
                    category: categoryId,
                    images: updatedImages,
                    quantity: quantity,
                    type: type,
                }
            }
        );

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