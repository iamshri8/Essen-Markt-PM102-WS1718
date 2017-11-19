
const clearSignUpScreen = () => {
    $("#sign-up").addClass("hidden");
    $("#error").addClass("hidden");
    $("#sign-up-mail").val("");
    $("#sign-up-pwd").val("");
    $("#login").removeClass("hidden");
};

const clearLoginScreen = () => {
    $("#login").addClass("hidden");
    $("#error").addClass("hidden");
    $("#login-mail").val("");
    $("#login-pwd").val("");
    $("#sign-up").removeClass("hidden");
};

const addUserData = (id,name, email) => {
    firebase.database().ref('/users/'+ id).set({
        name: name,
        email: email
    })
};
$(document).ready(() =>{
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    var facebookProvider = new firebase.auth.FacebookAuthProvider();
    $("#login-tab").click(() =>{
        clearSignUpScreen();
    });
    $("#sign-up-tab").click(() =>{
       clearLoginScreen();
    });
    $("#login-google").click(() =>{
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        firebase.auth().signInWithPopup(googleProvider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
            addUserData(user.uid, user.displayName, user.email);
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    });
    $("#login-facebook").click(() => {
        firebase.auth().signInWithPopup(facebookProvider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    });
    $("#login-button").click(() =>{
        firebase.auth().signInWithEmailAndPassword($("#login-mail").val(), $("#login-pwd").val()).then(function(user) {
            var user = firebase.auth().currentUser;
            $("#error").addClass("hidden");
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $("#error").removeClass("hidden");
            $("#error").append(errorMessage);
        });

        /*$.ajax({
            url: 'http://localhost:5000/login',
            data: {
                mail: $('#mail').val(),
                pwd: $('#pwd').val()
            },
            error: function() {
                $('#display').html('<p>An error has occurred</p>');
            },
            dataType: 'json',
            success: function(data) {
               $('#display')
                    .app end(data);
            },
            type: 'POST'
        });*/
    });

    $("#sign-up-button").click(() =>{
        firebase.auth().createUserWithEmailAndPassword($("#sign-up-mail").val(), $("#sign-up-pwd").val()).then(function(user) {
            var user = firebase.auth().currentUser;
            $("#error").addClass("hidden");
            addUserData(user.uid, $("#sign-up-name").val(), user.email)
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $("#error").removeClass("hidden");
            $("#error").append(errorMessage);
        });
    });

});