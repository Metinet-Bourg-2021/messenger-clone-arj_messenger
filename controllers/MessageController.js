const Conversation = require('./../models/Conversation');
const {Message} = require("../models/Message");
const userCtr = require("./UserController");
const global = require("./global");
const User = require('./../models/user');

async function deleteMessage({token, message_id, conversation_id,sockets,io}, callback)
{
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
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
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const message = await Message.findOne({id:message_id})
        message.content = content;
        message.edited = true;
        await message.save()

        const conversation = await  Conversation.findOne({id:conversation_id})

        let index = conversation.messages.findIndex(_message=>_message.id === message.id)

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
async function replyMessage({token, conversation_id, message_id, content,sockets},callback)
{
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const userConnected = await User.findOne({token: token})
        const conversationFind = await Conversation.findOne({id: conversation_id});
        const messageFind = await Message.findOne({id: message_id});

        if (conversationFind) {
            const message = new Message({
                id: await global.generateId(Message),
                from: userConnected.username,
                content: content,
                posted_at: Date.now(),
                reply_to: messageFind,
                delivered_to:{[userConnected.username]:new Date()}
            })
            conversationFind.messages.push(message);
            let messageSave = await message.save();
            await conversationFind.save();
            if (sockets.length > 0) {
                sockets.forEach((socket) => {
                    if (conversationFind.participants.includes(socket.username)) {
                        socket.client.emit('@messagePosted', {
                            conversation_id,
                            message: messageSave
                        })
                    }
                })
                return callback({code:"SUCCESS", data:{message:messageSave}});
            }
        }
        else{
            return callback({code:"NOT_FOUND_CONVERSATION", data:{}});
        }
    }catch (err) {
        console.log(err)
    }

}
async function postMessage({token, conversation_id, content,sockets,io}, callback)
{
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const userConnected = await User.findOne({token:token})
        const conversationFind = await  Conversation.findOne({id:conversation_id});

        if(conversationFind){
            const message = new Message({
                id: await global.generateId(Message),
                from:userConnected.username,
                content: content,
                posted_at: Date.now(),
            })
            conversationFind.updated_at = new Date();
            conversationFind.messages.push(message);
            let messageSave = await message.save();
            const conversationSave = await conversationFind.save();
            if(sockets.length > 0)
            {
                sockets.forEach((socket)=>{
                    if(conversationFind.participants.includes(socket.username)){
                        socket.client.emit('@messagePosted',{
                            conversation_id,
                            message:messageSave
                        })
                    }
                })

                return callback({code:"SUCCESS", data:{message:messageSave}});
            }
        }else{
            return callback({code:"NOT_FOUND_CONVERSATION", data:{}});
        }
    }catch (err){
        console.log(err)
    }
}

async function reactMessage({token, conversation_id, message_id, reaction,sockets}, callback)
{

    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const userConnected = await User.findOne({token:token})
        const conversationFind = await  Conversation.findOne({id:conversation_id});
        const message = conversationFind.messages.find(_message => _message.id === message_id)
        const messageIndex = conversationFind.messages.findIndex(_message => _message.id === message_id)

        message.reactions[userConnected.username] = reaction

        conversationFind.messages[messageIndex] = message
        conversationFind.markModified('message')
        message.markModified('reactions')

        let messageSave = await message.save();
        let conversationSave = await conversationFind.save();


        if(sockets.length > 0)
        {
            sockets.forEach((socket)=>{
                if(conversationFind.participants.includes(socket.username)){
                    socket.client.emit('@messageReacted',{
                        conversation_id,
                        message:messageSave
                    })
                }
            })

            return callback({code:"SUCCESS", data:{}});
        }
    }catch (err){
        console.log(err)
    }
}
module.exports = {deleteMessage: deleteMessage,updateMessage:updateMessage,postMessage:postMessage,replyMessage:replyMessage,reactMessage:reactMessage};
