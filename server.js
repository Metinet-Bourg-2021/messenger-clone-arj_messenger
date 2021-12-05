require('dotenv/config');
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const userCtr = require('./controllers/UserController')
const messageCtr = require('./controllers/MessageController')
const conversationCtr = require('./controllers/ConversationController')
let sockets  = []
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.BDD,{ useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log(err)
);
app.get("/", (req, res) => {
    res.send("A utiliser pour du debug si vous avez besoin...");
});

server.listen(process.env.PORT, () => {
    console.log("Server is listening");
});

io.on("connection", socket => {
    //Penser a conserver le socket pour pouvoir s'en servir plus tard
    //Remplacer les callbacks par des fonctions dans d'autres fichiers.
    socket.on("@authenticate", ({username, password}, callback)=>userCtr.authenticate({username, password,socket,sockets},callback));
    socket.on("@getUsers",({token},callback)=>userCtr.getUsers({token,sockets,io},callback));
    socket.on("@getOrCreateOneToOneConversation",({token, username}, callback) => conversationCtr.getOrCreateOneToOneConversation({token, username,sockets,io}, callback));
    socket.on("@createManyToManyConversation", ({token, usernames}, callback) => {callback({code:"SUCCESS", data:{}});});
    socket.on("@getConversations", conversationCtr.getConversations);

    socket.on("@seeConversation", ({token, conversation_id, message_id}, callback) => conversationCtr.seeConversation({token, conversation_id, message_id,sockets,io}, callback));
    socket.on("@postMessage",({token, conversation_id, content}, callback)=>messageCtr.postMessage({token, conversation_id, content,sockets,io}, callback));

    socket.on("@replyMessage", ({token, conversation_id, message_id, content}, callback) => {callback({code:"SUCCESS", data:{}});});
    socket.on("@editMessage",messageCtr.updateMessage);
    socket.on("@reactMessage", ({token, conversation_id, message_id, reaction}) => {callback({code:"SUCCESS", data:{}});});
    socket.on("@deleteMessage",({token, message_id, conversation_id},callback)=>messageCtr.deleteMessage({token, message_id, conversation_id,socket,io},callback));
    socket.on("disconnect", (reason) =>{ });
});

// Addresse du serveur démo: wss://teach-vue-chat-server.glitch.me
