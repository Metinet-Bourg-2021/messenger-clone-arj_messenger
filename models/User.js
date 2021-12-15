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
        default:""
    },
    socketID:{
        type:String,
        default:""
    }
});
module.exports = mongoose.model('User', userSchema);



/*id: 1
messages: []
participants: (2) ['redouane', 'oui']
theme: "BLUE"
title: null
type: "one_to_one"
typing: []
updated_at: "2021-11-17T09:12:29.797Z"*/


/*

{
    "id":1,
    type:"one_to_one",
    participants:["John", "Jane"],
    messages:[],
    title: null,
    theme: "BLUE",
    updated_at: "1995-12-17T03:24:00",
    typing: []
}*/
