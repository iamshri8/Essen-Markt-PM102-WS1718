const functions = require('firebase-functions');
const firebase= require('firebase-admin');
const express = require('express');
const app = express();

app.get('/getProducts',(request, response) => {
    const ref= firebaseApp.database().ref('/products');
    ref.on('value', snap => {
        console.log(snap.val());
        response.send(snap.val());
    });
});
app.post('/addUser', (request, response) => {
    console.log(request.body.id+ request.body.name+ request.body.mail);
    firebase.database().ref('/users/'+ request.body.id).set({
        name: request.body.name,
        email: request.body.mail
    });
    response.send("ok");
});
const firebaseApp= firebase.initializeApp(
    functions.config().firebase
);

exports.app = functions.https.onRequest(app);
