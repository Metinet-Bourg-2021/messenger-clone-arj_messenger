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
        conversation.messages[index] = messageDelete
        await conversation.save()
        console.log(io.sockets.adapter.rooms)
       /* io.to(conversation.id).emit('@messageDeleted',{
            conversation_id:conversation.id,
            message:messageDelete
        });*/
        return callback({ code:"SUCCESS", data:{} });

    }catch (err){
        console.log(err)
    }
}
async function updateMessage({token, conversation_id, message_id, content}, callback)
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

        return callback({code:"SUCCESS", data:{}});

    }catch (err){
        console.log(err)
    }
}
async function postMessage({token, conversation_id, content}, callback)
{

}
module.exports = {deleteMessage: deleteMessage,updateMessage:updateMessage,postMessage:postMessage};