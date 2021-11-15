const bcrypt = require('bcrypt');
const User = require('./../models/user');
const Conversation = require('./../models/Conversation');
const Message = require('./../models/Message');

async function postMessage({token, conversation_id, content}, callback)
{

}
module.exports = {postMessage: postMessage};