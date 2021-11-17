const Conversation = require('./../models/Conversation');
const {Message} = require("../models/Message");
const userCtr = require("./UserController");
const global = require("./global");
const User = require('./../models/user');

async function deleteMessage({token, message_id, conversation_id,sockets,io}, callback)
{
    if(!userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
    try{
        const messageDelete = await Message.findOne({id:message_id})
        messageDelete.deleted = true;
        await messageDelete.save()

        const conversation = await  Conversation.findOne({id:conversation_id})

        let index = conversation.messages.findIndex(message=>message.id === message_id)
        conversation.messages.splice(index,1)
        await conversation.save()
        sockets.forEach((socket)=>{
            if(conversation.participants.includes(socket.username)){
                socket.client.emit('@messageDeleted',{
                    conversation_id,
                    message_id
                })
            }
        })
        return callback({ code:"SUCCESS", data:{} });

    }catch (err){
        console.log(err)
    }
}
async function updateMessage({token, conversation_id, message_id, content,sockets}, callback)
{
    if(!userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
    try{
        const message = await Message.findOne({id:message_id})
        message.content = content;
        message.edited = true;
        await message.save()

        const conversation = await  Conversation.findOne({id:conversation_id})

        let index = conversation.messages.findIndex(message=>message.id === message_id)
        conversation.messages[index] = message
        await conversation.save()

        sockets.forEach((socket)=>{
            if(conversation.participants.includes(socket.username)){
                socket.client.emit('@messageEdited',{
                    conversation_id,
                    message
                })
            }
        })

        return callback({code:"SUCCESS", data:{}});

    }catch (err){
        console.log(err)
    }
}
async function postMessage({token, conversation_id, content}, callback)
{
<<<<<<< Updated upstream
=======
    if(!await userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
    try{
        const userConnected = await User.findOne({token:token})
        const conversationFind = await  Conversation.findOne({id:conversation_id});
        const socketUserConnected = sockets.filter((socket)=>socket.username===userConnected.username)
        if(conversationFind){
            const message = new Message({
                id: await global.generateId(Message),
                from:userConnected.username,
                content: content,
                posted_at: Date.now(),
                //delivered_to: [userConnected.username,username],
            })
            conversationFind.messages.push(message);
            let messageSave = await message.save();
            await conversationFind.save();
            if(socketUserConnected.length > 0)
            {
                sockets.forEach((socket)=>{
                    if(conversationFind.participants.includes(socket.username)){
                        socket.client.emit('@messagePosted',{
                            conversation_id,
                            message:messageSave
                        })
                    }
                })
>>>>>>> Stashed changes

}
module.exports = {deleteMessage: deleteMessage,updateMessage:updateMessage,postMessage:postMessage};