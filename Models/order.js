const mongoose = require('mongoose');
const { stringify } = require('uuid');

const orderSchema = new mongoose.Schema({
        user:{
          type:mongoose.Schema.Types.ObjectId,
           ref:'User',
           require:true
         },
         orderItem:[{
             productId:{
                 type:mongoose.SchemaTypes.ObjectId,
                 ref: 'Products',
                 required:true
               },
               quantity:{
                  type:Number,
                  require:true,
                  default:1
               },
               productName:{
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
      }],
      address:{
            userName:{
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
        },


        couponDetails:{
                code: {
                  type: String,
                
                },
                discount: {
                  type: Number,
                  
                },
                miniParchaseAmt: {
                  type: Number,
                  
                },
                maxredeemableAmt: {
                  type: Number,
                  
                },

        },

        offerDetails:{
          offerName: {
            type: String,
            // required: true
        },
        offerType: {
            type: String,
            // required: true,
            // enum: ["Product Base", "Category Base"]
        },
        discount: {
            type: Number,
            // required: true
        }
        },

         paymentMethod:{
            type:String,
            require:true
         },
         orderDate:{
            type:Date,
            default: Date.now()
        },
        totalPrice:{
            type:Number,
            require:true 
        },
        orderStatus: {
            type: String,
            default: 'Processing',
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return requested', 'Return approved', 'Return Rejected', 'Refunded']
      },
      returnReason: {
        type: String,
        required: function() {
            return this.orderStatus === 'Return requested';
        }
    },

},{timestamps:true});

const Order = mongoose.model('Order',orderSchema);

module.exports = Order;