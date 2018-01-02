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

