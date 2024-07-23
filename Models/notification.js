const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;