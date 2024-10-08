const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    offerName: {
        type: String,
        required: true
    },
    offerType: {
        type: String,
        required: true,
        enum: ["Product Base", "Category Base"]
    },
    discount: {
        type: Number,
        required: true
    },
    offerStatus: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expDate: {
        type: Date,
        default: Date.now
    },
    selectedItems: {
        categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }]
    }
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
