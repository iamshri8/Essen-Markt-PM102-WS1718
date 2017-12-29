
module.exports = function(app, firebaseApp) {
    app.get('/getProducts',(request, response) => {
        const ref= firebaseApp.database().ref('/products');
        ref.on('value', snap => {
            console.log(snap.val());
            response.send(snap.val());
        });
    });

    app.post('/addProduct', (request, response) => {
        // firebaseApp.database().ref('/products/').push(request.body);
        // response.send("ok");
        console.log("here");
        let productsRef= firebaseApp.database().ref('/products');
        productsRef.orderByChild('city').equalTo('kiel').once('value', function (snap)  {
            console.log(snap.val());
        });
    });
    app.get('/getRegisteredRestaurants', (request, response) => {
        let array=[];
        let ref= firebaseApp.database().ref('/registeredRestaurants').once('value', (snap) => {
            console.log(snap.val());
            snap.forEach( (child) => {
                array.push(child.val());
            });
            response.send(array);
        });
    });
    app.post('/registerRestaurant', (request, response) => {
        firebaseApp.database().ref('/registeredRestaurants/').push(request.body);
        response.send("ok");
    });

    app.post('/addUser', (request, response) => {
        console.log(request.body.id+ request.body.name+ request.body.mail);
        firebaseApp.database().ref('/users/'+ request.body.id).set({
            name: request.body.name,
            email: request.body.mail
        });
        response.send("ok");
    });
};