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
        required: true,
        default:""
    },
    posted_at:{
        type: Date,
        required: true,
        default:new Date()
    },
    delivered_to:{
        type: Object,
        required: true,
        default:{}
    },
    reply_to:{
        type: Object,
        default:{}
    },
    edited: {
        type: Boolean,
        default:false
    },
    deleted: {
        type: Boolean,
        default:false
    },
    reactions: {
        type: Object,
        default:{}
    }

}, { minimize: false });

module.exports = {Message:mongoose.model('Message', messageSchema),Schema:messageSchema};
