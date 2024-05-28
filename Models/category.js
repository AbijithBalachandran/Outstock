const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

      name:{
            type:String,
            require:false
      },
      action:{
            type:String,
            require:false
      },
      description:{
            type:String,
            require:false
      },
      createdAt:{
        type:Date,
        require:new Date()
      },
      is_Delete:{
            type:Boolean,
            default:false
      }
})


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;