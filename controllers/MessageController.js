const Conversation = require('./../models/Conversation');
const {Message} = require("../models/Message");
const userCtr = require("./UserController");

async function deleteMessage({token, message_id, conversation_id}, callback)
{
    if(!userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
    try{
        const messageDelete = await Message.findOne({id:message_id})
        messageDelete.deleted = true;
        await messageDelete.save()

        const conversation = await  Conversation.findOne({id:conversation_id})

        let index = conversation.messages.findIndex(message=>message.id === message_id)
        conversation.messages[index].deleted = true
        await conversation.save()

        callback({code:"SUCCESS", data:{}});

    }catch (err){
        console.log(err)
    }
}
module.exports = {deleteMessage: deleteMessage};