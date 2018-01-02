const firebase= require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
var app	= express();
var server= require('http').createServer(app);
var io= require('socket.io').listen(server);

server.listen(5000,function () {
    console.log('Express server listening on port 5000');
});
app.use(cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const firebaseApp= firebase.initializeApp(
    {
        credential: firebase.credential.applicationDefault(),
        databaseURL: "https://foodmarkt-8a675.firebaseio.com"
    }
);
var post = require('./app/requests')(app, firebaseApp);// added to handle requests from client

var userIds= {};

io.sockets.on('connection', function (socket) {

    socket.on('addUser', function(data  ){
        console.log("adds");
        //Add socket details of the user
        socket.userId= data;
        // store the details of all the connected users
        userIds[data]= socket;
        console.log(data);
    });
    socket.on('sendChat', function (data, callback) {
        if( data.receiverId in userIds){
            //if receiver is online or connected
            callback(true);
            //send the chat data to both sender and the receiver
            userIds[data.receiverId].emit('updateChat', {id: data.senderName, msg: data.msg, receiverId: data.senderId});
            userIds[data.senderId].emit('updateChat', {id: data.senderName, msg: data.msg, receiverId: data.receiverId});

        }else {
            //if receiver is not online or connected
            callback(false);
            console.log("no receiver");
        }
    });

    socket.on('disconnect', function () {
        if(!socket.userId) return;
        delete userIds[socket.userId];
        console.log(Object.keys(userIds));
    });
});
