const bcrypt = require('bcrypt');
const User = require('./../models/user');
const picture = require('../pictures');
const jwt = require('jsonwebtoken');

async function authenticate({username, password}, callback)
{
    try{
        const hash = await bcrypt.hash(password,10)
        const userFind = await User.findOne({username:username})

        if(!userFind){
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
        }else{
            let isValid = await bcrypt.compare(password,userFind.password)
            if(isValid) return callback({code:"SUCCESS", data:{"username":userFind.username,"token":userFind.token,"picture_url":userFind.picture_url}});
            else return callback({code:"NOT_AUTHENTICATED", data:{}});
        }
    }catch (err){
        console.log(err)
    }
}

async function login(req, res)

{
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user === null)
            {
                return res.status(404).json({ error: 'User not found !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid)
                    {
                        return res.status(401).json({ error: 'Wrong password !' });
                    }
                    const token = jwt.sign({userId: user._id}, 'secret_key', {expiresIn: "1h"});
                    res.status(200).json({userId: user._id, token: token});
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

module.exports = {authenticate: authenticate, login: login};