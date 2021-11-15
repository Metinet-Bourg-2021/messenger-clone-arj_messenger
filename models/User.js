const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    } ,
    picture_url:{
        type:String,
        required:true
    },
    last_activity_at:{
        type:Date,
    },
    token:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('User', userSchema);