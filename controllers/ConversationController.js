const User = require('./../models/user');
const userCtr = require('./UserController')
const Conversation = require('./../models/Conversation');

async function getOrCreateOneToOneConversation({token, username}, callback)
{
    try{
        if(!await userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
        const userConnected = await User.findOne({token:token})
        const conversationFind = await Conversation.findOne({participants:[userConnected.username,username]})
        if(!conversationFind){
            const conversation = new Conversation({
                id:1,
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
                        id:conversationFind._id,
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
module.exports = {getOrCreateOneToOneConversation: getOrCreateOneToOneConversation};
