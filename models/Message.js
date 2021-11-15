const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    id:{
        type:Number,
        required:true
    },
    from:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    posted_at:{
        type: Date,
        required: true
    },
    delivered_to:{
        type: Array,
        required: true
    },
    reply_to:{
        type: String,
    },
    edited: {
        type: Boolean,
    },
    deleted: {
        type: Boolean,
    },
    reactions: {
        type: Array,
    }

}, { minimize: false });

module.exports = mongoose.model('Message', messageSchema);
