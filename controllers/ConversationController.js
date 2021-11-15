const bcrypt = require('bcrypt');
const User = require('./../models/user');
const Conversation = require('./../models/Conversation');

async function getOrCreateOneToOneConversation({token, username}, callback)
{

}


async function getConversations({token, username}, callback)
{
    try{
        
        const userFind = await User.findOne({token:token})
        if(userFind)
        {
            const conversations = await Conversation.find({});
            

            if(conversations.length > 0)
            {
                return callback({code:"SUCCESS", data:{conversations:conversations}});
            }else{
                return callback({code:"NOT_FOUND_CONVERSATION", data:{}});
            }
            
        }else{
            return callback({code:"NOT_FOUND_USER", data:{}});
        }
       

    }catch(err)
    {
        console.log(err)
    }
}


module.exports = {getOrCreateOneToOneConversation: getOrCreateOneToOneConversation, getConversations:getConversations};

