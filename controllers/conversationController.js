const bcrypt = require('bcrypt');
const User = require('./../models/user');
const Conversation = require('./../models/Conversation');

async function getOrCreateOneToOneConversation({token, username}, callback)
{
    console.log({token, username})

    // return callback({code:"SUCCESS", data:{}});
}
module.exports = {getOrCreateOneToOneConversation: getOrCreateOneToOneConversation};
