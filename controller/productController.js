const asyncHandler = require('express-async-handler');
const Products = require('../Models/products');


//---------------------product detail page rendering------------------------

const productManagementLoad = asyncHandler(async(req,res)=>{
      const products = await Products.find({});
      console.log("products________________"+products);

      res.render('productManagement',{products});
})

//------------------- Add product page rendering---------------------------- 

const addProductLoad = asyncHandler(async(req,res)=>{
      res.render('addProducts')
})
//-----------------------------edit  Product  page rendering -----------------------

const editProductLoad = asyncHandler(async(req,res)=>{
      const id = req.query.productsId;
      console.log('product Id'+id);

      const products = await Products.findById({_id:id});
                  // console.log('prodict------------------------'+products);
       if(products){
            res.render('editProduct',{products});
       }else{
            res.redirect('procductManagement');
       }

    });


    //--------------------------------------Add Product--------------------

    
const addNewproduct = async (req,res)=>{
      try {
console.log('console');
            let {name,action,description,price,discount,disPrice,category,quantity,type} = req.body

            const images = req.files.map(file => file.filename);
            const existingproduct =  await Products.findOne({name:name});
          
                 if(existingproduct){
                  return res.render('addproducts', { message: 'It\'s already added' });
                 }
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
                 category:category,
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

      } catch (error) {
            console.log(error.message);
            return res.status(500).render('addproducts', { message: 'An error occurred while adding the product' });
      }
}


    //---------------------------------------------update Product Status

    const updateProductStatus = asyncHandler(async(req,res)=>{

      const id = req.query.producstId;
      const productInfo = await Products.findById({_id:id});
              console.log("-----------------------productINFO"+productInfo);
              productInfo.is_Delete = !productInfo.is_Delete;
              await productInfo.save();
        
  let message = productInfo.is_block ? "User Blocked successfully" : "User Unblocked successfully";

       res.status(200).json({ message });
 });


 //-----------------





module.exports ={
      productManagementLoad,
      addProductLoad,
      editProductLoad,
      updateProductStatus,
      addNewproduct

}