const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    id: {
        type:Number,
        required:true
    },
    type: {
        type:String,
        required:true
    },
    participants: {
        type:Array,
        required:true
    },
    messages: {
        type:Array
    },
    title: {
        type:String,
        required:true
    },
    theme:{
        type:String,
        required:true
    },
    updated_at: {
        type:Date,
    },
    seen: {},
    typing: {}
}, { minimize: false });

module.exports = mongoose.model('Conversation', conversationSchema);