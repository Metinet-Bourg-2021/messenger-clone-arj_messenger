const User = require('./../models/user');
const userCtr = require('./UserController')
const Conversation = require('./../models/Conversation');
const global = require('./global')

async function getOrCreateOneToOneConversation({token, username, sockets}, callback)
{
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});

        const userFind = await User.findOne({username:username})
        if(!userFind) return callback({code:"NOT_VALID_USERNAMES", data:{}});

        const userConnected = await User.findOne({token:token})
        //const socketUserConnected = sockets.filter(socket=>socket.username === userConnected.username)

        const conversationFind = await Conversation.findOne({participants:[userConnected.username,userFind.username]})
         if(!conversationFind){
            const conversation = new Conversation({
                id:await global.generateId(Conversation),
                type:'one_to_one',
                participants:[userConnected.username,username],
                updated_at:Date.now(),
                seen:{
                    [userConnected.username]:{
                        message_id:-1,
                        time:-1
                    },
                    [userFind.username]:{
                        message_id:-1,
                        time:-1
                    },
                }

            })
            const conversationSave = await conversation.save()
            if(conversationSave){
                const socketUserFind = sockets.filter(socket=>socket.username === userFind.username)
                if(socketUserFind.length > 0) {
                    socketUserFind[0].client.emit('@conversationCreated', {
                        conversation: conversationSave
                    })
                }
                return callback({code:"SUCCESS",
                    data:{
                        conversation:conversationSave
                    }
                })
            }
        }else{
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

async function createManyToManyConversation({token, usernames, sockets}, callback)
{
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});

        const userFind = await User.findOne({token:token})
        //const socketUserFind = sockets.filter(socket=>socket.client.id === userFind.socketID);
        
        if(userFind)
        {
            usernames.push(userFind.username)
            let conversation = new Conversation({
                id: await global.generateId(Conversation),
                type: "many_to_many",
                participants: usernames,
                updated_at: Date.now(),
            });

            const conversationSave = await conversation.save(conversation);
            for(const username of usernames){
                
                //const userConnected = await User.findOne({username:username});
                const socketUserConnected = sockets.find(_socket => 
                    _socket.username === username
                );

                if(socketUserConnected !== undefined) {
                    socketUserConnected.client.emit('@conversationCreated',{
                        conversation:conversationSave
                    });
                }
            }

            return callback({code:"SUCCESS", data:{
                conversation: conversationSave
            }});


        }else{
            return callback({code:"NOT_AUTHENTICATED", data:{}});
        }
    }
    catch(err){
        console.log(err)
    }
}

async function deleteParticipants({token,conversation_id,username,sockets},callback){
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const userAdd = await User.findOne({username:username})
        if(!userAdd) return callback({code:"NOT_VALID_USERNAMES", data:{}});

        const conversation = await Conversation.findOne({id:conversation_id})
        if(conversation){
            let index = conversation.participants.findIndex(participant => participant === username)
            conversation.participants.splice(index,1)

            //remove les seen
            //update le updated_at
            const conversationSave = await conversation.save()
            console.log(conversationSave)
            sockets.forEach(socket=>{
                if(conversationSave.participants.includes(socket.username)){
                    socket.client.emit('@participantRemoved', {conversation: conversationSave})
                }
            })
            return callback({code:"SUCCESS",
                data:{
                    conversation:conversationSave
                }
            })
        }else{
            //code erreur
        }
    }catch (err) {
        console.log(err)
    }

}

async function addParticipants({token,conversation_id,username,sockets},callback){
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const userAdd = await User.findOne({username:username})
        if(!userAdd) return callback({code:"NOT_VALID_USERNAMES", data:{}});

        const conversation = await Conversation.findOne({id:conversation_id})
        if(conversation){
            conversation.participants.push(userAdd.username)
            //conversation.seen[userAdd.username] = -1

            const conversationSave = await conversation.save()
            console.log(conversationSave)
            sockets.forEach(socket=>{
                if(conversationSave.participants.includes(socket.username)){
                    socket.client.emit('@participantAdded', {conversation: conversationSave})
                }
            })
            return callback({code:"SUCCESS",
                data:{
                    conversation:conversationSave
                }
            })
        }else{
            //code erreur
        }
    }catch (err) {
        console.log(err)
    }

}

async function getConversations({token, username}, callback)
{
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
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
async function seeConversation({token, conversation_id, message_id,sockets,io}, callback){
    try{
        let isValid = await userCtr.tokenIsValid(token)
        if(!isValid) return callback({code:"NOT_FOUND_USER", data:{}});
        const userFind = await User.findOne({token:token})
        if(userFind)
        {
            const conversation = await Conversation.findOne({id:conversation_id});

            conversation.seen[userFind.username] = {
                message_id,
                time: new Date()
            }
            conversation.markModified('seen');

            const conversationSave  =  await conversation.save()

            sockets.forEach((socket)=>{
                if(conversation.participants.includes(socket.username)){
                    socket.client.emit('@conversationSeen',{
                        conversation:conversation
                    })
                }
            })
        }
    }catch (err){
        console.log(err)
    }
}

module.exports = {
    getOrCreateOneToOneConversation: getOrCreateOneToOneConversation, getConversations:getConversations, createManyToManyConversation:createManyToManyConversation,
    seeConversation:seeConversation,addParticipants:addParticipants,
    deleteParticipants:deleteParticipants
};