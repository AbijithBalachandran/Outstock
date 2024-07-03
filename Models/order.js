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
                 ref: 'Product',
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
      address:[{
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
        }],
         paymentMethod:{
            type:String,
            require:true
         },
         orderDate:{
            type:Date,
            default: Date.now()
        },
        orderStatus: {
            type: String,
            default: 'Processing',
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Completed', 'Return requested', 'Return approved', 'Return Rejected', 'Refunded']
      },
});

const Order = mongoose.model('Order',orderSchema);

module.exports = Order;