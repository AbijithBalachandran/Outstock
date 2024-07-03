
const { ObjectId, Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

      user:{
        type:mongoose.Schema.Types.ObjectId,
         ref:'User',
        require:true
      },
      name:{
          type:String,
          require:true
      },
      address:{
        type:String,
        require:true
      },
      phone:{
         type:Number,
         require:true
      },
      location:{
            type:String,
            require:true
      },
      landmark:{
            type:String,
            require:true
      },
      pincode:{
            type:String,
            require:true
      },
      email:{
            type:String,
            require:true
      },
      city:{
          type:String,
          require:true
      }

},{timestamps:true});

const Address = mongoose.model('Address',addressSchema);

module.exports = Address;