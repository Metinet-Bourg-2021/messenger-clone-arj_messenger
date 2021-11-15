const mongoose = require('mongoose');
const {Schema} = require('./Message');

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
        type:[String],
        default:[]
    },
    messages: {
        type:[Schema],
        default:[]
    },
    title: {
        type:String,
        default:null
    },
    theme:{
        type:String,
        default:"BLUE"
    },
    updated_at: {
        type:Date,
    },
    seen: {
        type:Object,
        default:{}
    },
    typing: {
        type:Object,
        default:{}
    }
}, { minimize: false });

module.exports = mongoose.model('Conversation', conversationSchema);