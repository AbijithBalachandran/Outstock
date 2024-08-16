const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
      Fname:{
        type:String,
        require:true
      },
      Lname:{
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
      },
      is_varified:{
            type:Boolean,
            default:false
      }
})
userSchema.methods.comparePassword = async function(plainPassword) {
      return bcrypt.compare(plainPassword, this.password);
  };
const User = mongoose.model('User',userSchema);

module.exports = User;