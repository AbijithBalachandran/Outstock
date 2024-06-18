const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

      name :{
        type:String,
        require:true
      },
      price:{
        type:Number,
        require:true
      },
      images:[{
        type:String,
        require:true
      }],
      category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require:true
      },
       quantity:{
         type:Number,
         require:true   
      },
      color:[{
        type:String,
        require:true
      }],
      type:{
         type:String,
         require:true   
      },
      discount:{
         type:Number,
         require:true
      },
      description:{
         type:String,
         require:true   
      },
      action:{
            type:Boolean,
            require:false
      },
      disPrice:{
            type:Number,
            require:true
      },
      createdAt:{
            type:Date,
            require:new Date()
      },
      is_Delete:{
            type:Boolean,
            require:false
      }

})



const Products = mongoose.model('Products', productSchema);

module.exports = Products;