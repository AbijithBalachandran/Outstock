const asyncHandler = require('express-async-handler');
const Category = require('../Models/category');
const { name } = require('ejs');




//-------------------------------Rendering category management shows---------------------------//

const categoryLoad = asyncHandler(async (req, res) => {
      const categories = await Category.find({});
      console.log("categories --------------------------------", categories);
      res.render('categoryManagement', { categories });
  }); 

//-------------------------- Rendering add category page  ---------------------------------//

const addCategoryLoad = async (req,res)=>{
      try {
            res.render('addcategory');
      } catch (error) {
            console.log(error.message);
      }
}
//--------------------------admin addining New category --------------------------------------//

const addNewcategory = async (req,res)=>{
      try {

            const {name,action,description} = req.body
            const existingCategory =  await Category.findOne({name:name});
          
           console.log("existingCategory===="+name);
                 if(existingCategory){
                  //res.render('addcategory',{message:'Its Already added'});
                  return res.render('addcategory', { message: 'It\'s already added' });
                 }

             const newCategory = new Category ({
                 name:name,
                 action:action,
                 description:description,
                 createdAt:new Date()
             })

                  await newCategory.save();

                 if (newCategory.action ==='list') {
                  newCategory.is_Delete = true;
                  await newCategory.save();
                 }

                  res.redirect('categoryManagement');

      } catch (error) {
            console.log(error.message);
            return res.status(500).render('addcategory', { message: 'An error occurred while adding the category' });
      }
}


//----------------------------Update the category status to List and Unlist -------------------------------//

 const updateCategoyStatus = asyncHandler(async(req,res)=>{

      const id = req.query.categoryId;
      const categoryInfo = await Category.findById({_id:id});
              console.log("-----------------------categoryINFO"+categoryInfo);
              categoryInfo.is_Delete = !categoryInfo.is_Delete;
              await categoryInfo.save();
        
  let message = categoryInfo.is_block ? "User Blocked successfully" : "User Unblocked successfully";

       res.status(200).json({ message })
 });

 //--------------------------------Edit Category page Loading ----------------------------------------------------------------//

   
    const editCategoryLoad = asyncHandler(async(req,res)=>{
      const id = req.query.categoryId;
      console.log('hgasdfgh'+id);
      const categories = await Category.findById({_id:id});
                  console.log('categories------------------------'+categories);
       if(categories){
            res.render('editCategory',{categories});
       }else{
            res.redirect('categoryManagement');
       }

    });

//----------------------------------------------Edit and Update The Categories =-----------------------------------//


const editAndUpadateLoad = asyncHandler(async(req,res)=>{

      await Category.findByIdAndUpdate(
            { _id:req.body.id},
            {$set:{
                  name:req.body.name,
                  action:req.body.action,
                  description:req.body.description
            }});

      res.redirect('categoryManagement');
})

//---------------------------------------------    -----------------------------------------------------------//



module.exports={
      categoryLoad,
      addCategoryLoad,
      addNewcategory,
      updateCategoyStatus,
      editCategoryLoad,
      editAndUpadateLoad
}