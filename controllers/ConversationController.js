const User = require('./../models/user');
const userCtr = require('./UserController')
const Conversation = require('./../models/Conversation');
const global = require('./global')
async function getOrCreateOneToOneConversation({token, username,sockets}, callback)
{
    try{
        if(!await userCtr.tokenIsValid(token)) return callback({code:"NOT_FOUND_USER", data:{}});
        const userFind = await User.findOne({username:username})
        const socketUserFind = sockets.filter(socket=>socket.client.id === userFind.socketID)
        if(!userFind) return callback({code:"NOT_VALID_USERNAMES", data:{}});

        const userConnected = await User.findOne({token:token})
        const socketUserConnected = sockets.filter(socket=>socket.client.id === userConnected.socketID)

        const conversationFind = await Conversation.findOne({participants:[userConnected.username,userFind.username]})
         if(!conversationFind){
            const conversation = new Conversation({
                id:await global.generateId(Conversation),
                type:'one_to_one',
                participants:[userConnected.username,username],
                updated_at:Date.now(),
            })
            const conversationSave = await conversation.save()
            if(conversationSave){
                socketUserConnected[0].client.join(conversationSave.id)
                socketUserFind[0].client.emit('@conversationCreated',{
                    conversation:conversationSave
                })
                return callback({code:"SUCCESS",
                    data:{
                        conversation:conversationSave
                    }
                })
            }
        }else{
             socketUserConnected[0].client.join(conversationFind.id)
             return callback({code:"SUCCESS",
                data:{
                    conversation:conversationFind
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

            return callback({code:"SUCCESS", data:{conversations:conversations}});

        }
    }catch(err)
    {
        console.log(err)
    }
}


module.exports = {getOrCreateOneToOneConversation: getOrCreateOneToOneConversation, getConversations:getConversations};

