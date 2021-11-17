const bcrypt = require('bcrypt');
const User = require('./../models/user');
const picture = require('../pictures');
const jwt = require('jsonwebtoken');
const {Message} = require("../models/Message");
const global = require('./global')
const Conversation = require('../models/Conversation')

async function authenticate({username, password,socket,sockets}, callback)
{
    try{
        const userFind = await User.findOne({username:username})
        if(!userFind){
            await save({username, password,socket,sockets}, callback)
        }else{
            userFind.socketID = socket.id
            sockets.push({username:userFind.username,client:socket})
            const userSave = await userFind.save()
            if(!userSave) return callback({code:"NOT_AUTHENTICATED", data:{}});
            let isValid = await bcrypt.compare(password,userFind.password)
            if(isValid) return callback({code:"SUCCESS", data:{username:userFind.username,token:userFind.token,picture_url:userFind.picture_url}});
            else return callback({code:"NOT_AUTHENTICATED", data:{}});
        }
    }catch (err){
        console.log(err)
    }
}

async function save({username, password,socket,sockets}, callback)
{
    const hash = await bcrypt.hash(password,10)
    let user = new User({
        username: username,
        password: hash,
        picture_url:picture.getRandomURL(),
        socketID:socket.id
    });
    const token = await jwt.sign({userId: user._id}, 'secret_key');
    user.token = token
    const userSave = await user.save(user)
    if(!userSave){
        return callback({code:"NOT_AUTHENTICATED", data:{}});
    }
    sockets.push({username:userSave.username,client:socket})
    return callback({code:"SUCCESS", data:{"username":userSave.username,"token":userSave.token,"picture_url":userSave.picture_url}});
}


async function getUsers({token,sockets,io}, callback)
{
    try{
        if(!tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
        const userConnected = await User.findOne({token:token});
        console.log(sockets)
        const users = await User.find({});
        let usernames = []
        sockets.forEach((socket)=>usernames.push(socket.username))
        const socketUserConnected = sockets.filter(socket=>socket.client.id === userConnected.socketID)
        io.emit('@usersAvailable',{
            usernames
        })
        return callback({code:"SUCCESS", data:{users:users}});
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
        await message.save()
        await conversation.save()
    }catch (err){
        console.log(err)
    }
}

module.exports = {authenticate: authenticate,getUsers:getUsers,tokenIsValid:tokenIsValid};