const User = require('./../models/user');
const userCtr = require('./UserController')
const Conversation = require('./../models/Conversation');
const global = require('./global')

async function getOrCreateOneToOneConversation({token, username}, callback)
{
    try{
        if(!await userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
        const findUser = await User.findOne({usernale:username})
        if(!findUser) return callback({code:"NOT_VALID_USERNAMES",data:{}})

        const userConnected = await User.findOne({token:token})
        const conversationFind = await Conversation.findOne({participants:[userConnected.username,username]})
        if(!conversationFind){
            const conversation = new Conversation({
                id:await global.generateId(Conversation),
                type:'one_to_one',
                participants:[userConnected.username,username],
                updated_at:Date.now(),
            })
            const conversationSave = await conversation.save()
            if(conversationSave){
                console.log({
                    conversation:{
                        id:conversationSave.id,
                        type:conversationSave.type,
                        participants:conversationSave.participants,
                        title:conversationSave.title,
                        theme:conversation.theme,
                        seen: conversationSave.seen,
                        typing: conversationSave.typing,
                        messages:conversationSave.messages,
                        updated_at:conversationSave.updated_at
                    }
                })
                return callback({code:"SUCCESS",
                    data:{
                        conversation:{
                            id:conversationSave.id,
                            type:conversationSave.type,
                            participants:conversationSave.participants,
                            title:conversationSave.title,
                            theme:conversation.theme,
                            seen: conversationSave.seen,
                            typing: conversationSave.typing,
                            messages:conversationSave.messages,
                            updated_at:conversationSave.updated_at
                        }
                    }
                })
            }
        }else{
            return callback({code:"SUCCESS",
                data:{
                    conversation:{
                        id:conversationFind.id,
                        type:conversationFind.type,
                        participants:conversationFind.participants,
                        title:conversationFind.title,
                        theme:conversationFind.theme,
                        updated_at:conversationFind.updated_at ,
                        seen: conversationFind.seen,
                        typing: conversationFind.typing,
                        message:conversationFind.messages
                    }
                }
            })
        }
    }catch (err){
        console.log(err)
    }
}


async function getConversations({token, username}, callback)
{
    if(!await userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
    try{

        const userFind = await User.findOne({token:token})
        if(userFind)
        {
            const conversations = await Conversation.find({participants : { $in :userFind.username  }});
            if(conversations.length > 0)
            {
                return callback({code:"SUCCESS", data:{conversations:conversations}});
            }else{
                return callback({code:"NOT_FOUND_CONVERSATION", data:{}});
            }
            
        }
    }catch(err)
    {
        console.log(err)
    }
}

module.exports = {getOrCreateOneToOneConversation: getOrCreateOneToOneConversation, getConversations:getConversations};

