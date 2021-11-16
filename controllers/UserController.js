const bcrypt = require('bcrypt');
const User = require('./../models/user');
const picture = require('../pictures');
const jwt = require('jsonwebtoken');
const Conversation = require("./../models/Conversation");
const {Message} = require("../models/Message");
const global = require('./global')

async function authenticate({username, password}, callback)
{
    try{
        //await fakedata()
        const userFind = await User.findOne({username:username})
        if(!userFind){
            await save({username, password}, callback)
        }else{
            let isValid = await bcrypt.compare(password,userFind.password)
            if(isValid) return callback({code:"SUCCESS", data:{username:userFind.username,token:userFind.token,picture_url:userFind.picture_url}});
            else return callback({code:"NOT_AUTHENTICATED", data:{}});
        }
    }catch (err){
        console.log(err)
    }
}

async function save({username, password}, callback)
{
    const hash = await bcrypt.hash(password,10)
    let user = new User({
        username: username,
        password: hash,
        picture_url:picture.getRandomURL(),
    });
    const token = await jwt.sign({userId: user._id}, 'secret_key');
    user.token = token
    const userSave = await user.save(user)
    if(!userSave){
        return callback({code:"NOT_AUTHENTICATED", data:{}});
    }
    return callback({code:"SUCCESS", data:{"username":userSave.username,"token":userSave.token,"picture_url":userSave.picture_url}});
}


async function getUsers({token}, callback)
{
    try{
        if(!tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
        const users = await User.find({});
        if(users.length > 0)
        {
            return callback({code:"SUCCESS", data:{users:users}});
        }else{
            return callback({code:"NOT_FOUND_USER", data:{users:[]}});
        }
    }
    catch(err){
        console.log(err)
    }
}

async function tokenIsValid(token) {
    try {
        const userFind = await User.findOne({token: token})
        if (userFind) {
            return true;
        }
    } catch (err) {
        console.log(err)
    }
}
async function  fakedata(){
    const message = new Message({
        id:await global.generateId(Message),
        from:"redouane",
        content:"bonjour !",

    })
    const conversation = new Conversation({
        id:await global.generateId(Conversation),
        type:'one_to_one',
        participants:['redouane','oui'],
        updated_at:Date.now(),
        messages:[message]
    })
    try{
        const messageSave = await message.save()
        const conversationSave = await conversation.save()
    }catch (err){
        console.log(err)
    }
}

module.exports = {authenticate: authenticate,getUsers:getUsers,tokenIsValid:tokenIsValid};