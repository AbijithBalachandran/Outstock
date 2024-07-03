
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

        user:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         require:true 
        },
        cartItem:[{
            products:{
                type:mongoose.Schema.Types.ObjectId, 
                ref:'Products',
                require:true
            },
            quantity:{
                type:Number,
                 default:1
            }
        }],
        cartTotal:{
            type:Number,
            default:0
        }
       
})

const cart =  mongoose.model('Cart',cartSchema);

module.exports=cart;