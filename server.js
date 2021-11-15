require('dotenv/config');
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const userCtr = require('./controllers/UserController')
const convCtr = require('./controllers/ConversationController')
const messageCtr = require('./controllers/MessageController')

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

    socket.on("@authenticate", userCtr.authenticate);
    
    socket.on("@getUsers", userCtr.getUsers);

    socket.on("@getOrCreateOneToOneConversation", ({token, username}, callback) => { callback({code:"SUCCESS", data:{}});  });

    socket.on("@createManyToManyConversation", ({token, usernames}, callback) => {callback({code:"SUCCESS", data:{}});});

    socket.on("@getConversations", convCtr.getConversations);
    
    socket.on("@postMessage", messageCtr.postMessage);

    socket.on("@seeConversation", ({token, conversation_id, message_id}, callback) => {callback({code:"SUCCESS", data:{}}); });
    socket.on("@replyMessage", ({token, conversation_id, message_id, content}, callback) => {callback({code:"SUCCESS", data:{}});});
    socket.on("@editMessage", ({token, conversation_id, message_id, content}, callback) => {callback({code:"SUCCESS", data:{}});});
    socket.on("@reactMessage", ({token, conversation_id, message_id, reaction}) => {callback({code:"SUCCESS", data:{}});});
    socket.on("@deleteMessage", ({token, conversation_id, message_id, content}) => {callback({code:"SUCCESS", data:{}});});

    socket.on("disconnect", (reason) =>{ });
});

// Addresse du serveur démo: wss://teach-vue-chat-server.glitch.me