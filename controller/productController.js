const asyncHandler = require('express-async-handler');
const Products = require('../Models/products');
const { default: mongoose } = require('mongoose');
const categories = require('../Models/category')


//---------------------product detail page rendering------------------------

const productManagementLoad = asyncHandler(async(req,res)=>{
      //const product = await Products.find({});
      //console.log("products________________"+product);

      const FirstPage = 8;
      const currentPage = parseInt(req.query.page) || 1;

      const start = (currentPage - 1) * FirstPage;


      const  productData = await Products.find({}).populate('category').skip(start).limit(FirstPage);
      const products = await Products.countDocuments({});



      const totalPages = Math.ceil(products / FirstPage);

      res.render('productManagement',{ product: productData, currentPage, totalPages });
})


//------------------- Add product page rendering---------------------------- 

const addProductLoad = asyncHandler(async(req,res)=>{
    const category = await categories.find({}); 
      res.render('addProducts',{category});
})


  //--------------------------------------Add Product------------------------
   
const addNewproduct = asyncHandler(async(req,res)=>{

           let {name,action,description,price,discount,disPrice,category,quantity,type} = req.body
           const categoryDoc = await categories.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });

        //   console.log('categoryDoc====='+categoryDoc);
        if (!categoryDoc) {
            return res.status(400).send('Category not found');
        }
        const categoryId = categoryDoc._id;
        // console.log("categoryId: " + categoryId);


           const images = req.files.map(file => file.filename);

           const product =  await Products.findOne({name}).populate('category');
         
        //    console.log('product'+name);
            
                if(action == 'list'){
                 action = true;
                }
                else if(action == 'unlist'){
                 action = false;
                }
           //      if(discount){
           //       console.log(discount)
           //      }
           //      else{
           //       console.log('none')
           //      }

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
            })

                 const productData = await newproduct.save();
                 console.log(productData)

                if (newproduct.action ==='list') {
                 newproduct.is_Delete = true;
                 await newproduct.save();
                }

                 res.redirect('/admin/productManagement');

}) 




//-----------------------------edit  Product  page rendering -----------------------

const editProductLoad = asyncHandler(async(req,res)=>{
      const id = req.query.productId;
     // console.log('product Id'+id);
      const category = await categories.find({});
      const product = await Products.findById({_id:id}).populate('category');
                  // console.log('prodict------------------------'+products);
       if(product){
            res.render('editProduct',{product,category});
       }else{
            res.redirect('/admin/procductManagement');
       }

    });

//----------------------------------------------edit product -----------------------------------------------------


const editAndUpdateProduct = asyncHandler(async (req, res) => {

    let {name,action,description,price,discount,disPrice,category,quantity,type} = req.body
           const categoryDoc = await categories.findOne({ name:{ $regex: new RegExp(`^${category}$`, 'i') }})
        
        if (!categoryDoc) {
            return res.status(400).send('Category not found');
        }
        const categoryId = categoryDoc._id;
        console.log("categoryId: " + categoryId);


     const existingProduct = await Products.findById(req.body.id);
    console.log('existingProduct'+existingProduct);
    if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const newImages = req.files ? req.files.map(file => file.filename) : [];

    const updatedImages = [...existingProduct.images];
    for (let i = 0; i < newImages.length; i++) {
        updatedImages[i] = newImages[i];
    }

 await Products.findByIdAndUpdate(
         req.body.id ,
        {
            $set: {
                name:name,
                action:action,
                description:description,
                price:price,
                discount:discount,
                disPrice:disPrice,
                category:categoryId,
                images: updatedImages,
                quantity:quantity,
                type:type,
            }
        }
    );

    console.log("Edit success");
    res.redirect('productManagement');
});



   
 //---------------------------------------------update Product Status ----------------------------------------------------------
 

    const updateProductStatus = asyncHandler(async(req,res)=>{

      const id = req.query.productId;
      const productInfo = await Products.findById({_id:id});
             // console.log("-----------------------productINFO"+productInfo);
              productInfo.is_Delete = !productInfo.is_Delete;
              await productInfo.save();
        
  let message = productInfo.is_Delete ? "User list successfully" : "User Unlist successfully";

       res.status(200).json({ message });
 });



 //------------------------------delete Product ----------------------------------------------------------------------------

 const deleteProduct = asyncHandler(async(req,res)=>{

            const id = req.query.productId;
           // console.log('id_ for delete'+id);

           await Products.deleteOne({ _id:id });
            res.redirect('/admin/productManagement')

});

//-----------------------------------------------search product ----------------------------------------------

const searchProduct = asyncHandler(async(req,res)=>{
     let product=[];
     const currentPage=parseInt(req.query.page);
     const FirstPage = 8;
     const start = (currentPage-1) * FirstPage;
     const products = await Products.countDocuments({is_Admin:false});
     const totalPages = Math.ceil(product / FirstPage);

       const productData ={
           $or:[{name :{$regex:req.query.search,$options:'i'}},
              {category:{$regex:req.query.search,$options:'i'}},
           ] 
       } 
       if(req.query.search){
            product = await Products.find(productData).skip(start).limit(FirstPage);
       }else{
            product = await Products.find().skip(start).limit(FirstPage);
       }

       res.render('productManagement',{product,currentPage,totalPages});
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