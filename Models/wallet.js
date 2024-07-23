const mongoose = require('mongoose')

const walletSchema = mongoose.Schema({
    userId : {
        type : mongoose.SchemaTypes.ObjectId,
        required : true
    },
    walletAmount :{
        type : Number,
        default : 0
    },
    transaction: [{
        amount : {
            type : Number,
            default: 0 
        },
        PaymentType:{ 
            type:String,
            default:null
        },
        date:{
            type:Date,
            default:Date.now
        }
    }]
})

const Wallet =  mongoose.model('Wallet',walletSchema);
module.exports = Wallet;