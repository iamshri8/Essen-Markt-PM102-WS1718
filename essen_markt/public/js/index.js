
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
    $.ajax({
        url: 'http://localhost:5000/addUser',
        data: {
            id: id,
            name: name,
            mail: email
        },
        dataType: 'text',
        type: 'POST',
        success: function(data) {
            navigateToProductsPage(name);
        },
        error: function() {
            $("#error").removeClass("hidden");
            $("#error").append("error occurred in adding user data");
        },
    });
};
const navigateToProductsPage = (data) => {
    var source = document.getElementById('entry-template').innerHTML;
    var template = Handlebars.compile(source);
    var html = template({data});
    $('#products').html(html);
    $(".login-register-component").addClass("hidden");
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
        googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        firebase.auth().signInWithPopup(googleProvider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            $("#error").addClass("hidden");
            addUserData(user.uid, user.displayName, user.email);

        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            $("#error").removeClass("hidden");
            $("#error").html(errorMessage);
        });
    });
    $("#login-facebook").click(() => {
        firebase.auth().signInWithPopup(facebookProvider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            $("#error").addClass("hidden");
            addUserData(user.uid, user.displayName, user.email);
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            $("#error").removeClass("hidden");
            $("#error").html(errorMessage);
        });
    });
    $("#login-button").click(() =>{
        firebase.auth().signInWithEmailAndPassword($("#login-mail").val(), $("#login-pwd").val()).then(function(user) {
            var user = firebase.auth().currentUser;
            $("#error").addClass("hidden");
            navigateToProductsPage(user.email);
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $("#error").removeClass("hidden");
            $("#error").html(errorMessage);
        });


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
            $("#error").html(errorMessage);
        });
    });
});