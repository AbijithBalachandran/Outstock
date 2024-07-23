
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({

        user:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         require:true 
        },
        wishlistItem:[{
            products:{
                type:mongoose.Schema.Types.ObjectId, 
                ref:'Products',
                require:true
            }
        }],
})

const wishlist =  mongoose.model('Wishlist',wishlistSchema);

module.exports = wishlist;