const bcrypt = require('bcrypt');
const User = require('./../models/user');
const picture = require('../pictures');
const jwt = require('jsonwebtoken');

async function authenticate({username, password}, callback)
{
    try{
        const userFind = await User.findOne({username:username})
        if(!userFind){
            await save({username, password}, callback)
        }else{
            let isValid = await bcrypt.compare(password,userFind.password)
            if(isValid) return callback({code:"SUCCESS", data:{"username":userFind.username,"token":userFind.token,"picture_url":userFind.picture_url}});
            
            else return callback({code:"NOT_AUTHENTICATED", data:{}});
        }
    }catch (err){
        console.log(err)
    }
}

async function save({username, password}, callback)
{
    const hash = await bcrypt.hash(password,10)
    let user = new User({
        username: username,
        password: hash,
        picture_url:picture.getRandomURL(),
    });
    const token = await jwt.sign({userId: user._id}, 'secret_key');
    user.token = token
    const userSave = await user.save(user)
    if(!userSave){
        return callback({code:"NOT_AUTHENTICATED", data:{}});
    }
    return callback({code:"SUCCESS", data:{"username":userSave.username,"token":userSave.token,"picture_url":userSave.picture_url}});
}


async function getUsers({token}, callback)
{
    try{
        const userFind = await User.findOne({token:token})
        if(userFind)
        {
            
            const users = await User.find({});
            
            if(users.length > 0)
            {
                return callback({code:"SUCCESS", data:{users:users}});
            }else{
                return callback({code:"NOT_FOUND_USER", data:{}});
            }
        
        }else{
            return callback({code:"NOT_AUTHENTICATED", data:{}});
        }
    }
    catch(err){
        console.log(err)
    }
}




module.exports = {authenticate: authenticate,getUsers:getUsers};