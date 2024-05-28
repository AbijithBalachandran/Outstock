
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
      Fname:{
        type:String,
        require:true
      },
      email:{
        type:String,
        require:true
      },
      password:{
        type:String,
        require:true
      },
      mobile:{
            type:Number,
      },
      is_Admin:{
            type:Boolean,
            default: false
      },
      is_block:{
            type:Boolean,
            default: false
      },
      createdAt :{
            type: Date,
            default:new Date()
      }
})

module.exports = mongoose.model('User',userSchema);