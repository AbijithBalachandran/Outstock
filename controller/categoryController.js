const asyncHandler = require('express-async-handler');
const Category = require('../Models/category');
const { name } = require('ejs');




//-------------------------------Rendering category management shows---------------------------//

const categoryLoad = asyncHandler(async (req, res) => {
      const categories = await Category.find({});
      //console.log("categories --------------------------------", categories);
      res.render('categoryManagement', { categories,ActivePage: 'categoryManagement' });
  }); 

//-------------------------- Rendering add category page  ---------------------------------//

const addCategoryLoad = async (req,res)=>{
      try {
           
            res.render('addcategory',{ActivePage: 'categoryManagement' });
      } catch (error) {
            console.log(error.message);
      }
}
//--------------------------admin addining New category --------------------------------------//

const addNewCategory = async (req, res) => {
    try {
        const { name, action, description } = req.body;
        console.log('category name'+name);
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (existingCategory) {
            return res.render('addCategory', { message: 'It\'s already added', name, action, description });
        }

        const newCategory = new Category({
            name,
            action,
            description,
            createdAt: new Date()
        });

        await newCategory.save();

        if (newCategory.action === 'list') {
            newCategory.is_Delete = true;
            await newCategory.save();
        }

        res.redirect('/admin/categoryManagement');
    } catch (error) {
        console.log(error.message);
        return res.status(500).render('addCategory', { message: 'An error occurred while adding the category', name, action, description });
    }
};


//----------------------------Update the category status to List and Unlist -------------------------------//

 const updateCategoyStatus = asyncHandler(async(req,res)=>{

      const id = req.query.categoryId;
      const categoryInfo = await Category.findById({_id:id});
              //console.log("-----------------------categoryINFO"+categoryInfo);
              categoryInfo.is_Delete = !categoryInfo.is_Delete;
              await categoryInfo.save();
        
  let message = categoryInfo.is_Delete ? "User List successfully" : "User Unlist successfully";

       res.status(200).json({ message });
 });

 //--------------------------------Edit Category page Loading ----------------------------------------------------------------//

   
    const editCategoryLoad = asyncHandler(async(req,res)=>{
      const id = req.query.categoryId;
     // console.log('hgasdfgh'+id);
      const categories = await Category.findById({_id:id});
                //  console.log('categories------------------------'+categories);
       if(categories){
            res.render('editCategory',{categories , ActivePage: 'categoryManagement' });
       }else{
            res.redirect('/categoryManagement');
       }

    });

//----------------------------------------------Edit and Update The Categories =-----------------------------------//

const editAndUpdateLoad = asyncHandler(async (req, res) => {
      const { name, description, id } = req.body;
    //   console.log('description==', description);
    //   console.log('existingCategory====', name);
    
      const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingCategory) {
          const categories = await Category.findById(id);
          return res.render('editCategory', { categories, message: 'It\'s already added' });
      }
    
      await Category.findByIdAndUpdate(
          id,
          { $set: { name, description } }
      );
    
      res.redirect('/categoryManagement');
  });
  

//---------------------------------------------    -----------------------------------------------------------//



module.exports={
      categoryLoad,
      addCategoryLoad,
      addNewCategory,
      updateCategoyStatus,
      editCategoryLoad,
      editAndUpdateLoad,

}