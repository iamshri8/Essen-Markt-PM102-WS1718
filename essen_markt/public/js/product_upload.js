let userAddress;
let userCity;
let userZipCode;
let userId= getQueryVariable("user");
let registeredRestaurants;
let user;
let socketReceiver='lsfoZnaxG5c0sN8XEGlc50W1Cdz2';
let donateAsIndividual=true;
var socket = io.connect('http://localhost:5000/');


//on connection with server socket
socket.on('connect', function(){
    // send the server, userId of the connected user
    console.log("emit");
    socket.emit('addUser',userId);
});
const setInitialView = () => {
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
    $('#chat-container').addClass('hidden');
    $('.show-individual').addClass("hidden");
    $('.donate-to-restaurant').addClass("hidden");
};
$(document).ready(() => {
    setInitialView();
    getUserDetails();
    getCurrentLocation();

    // when the client clicks SEND in the chat box
    $('#datasend').click(function () {
        var message = $('#data').val();
        $('#data').val('');

        // tell server to execute 'sendchat' and pass the sender and receiver details
        socket.emit('sendChat', {
            msg: message,
            receiverId: socketReceiver,
            senderId: userId,
            senderName: user.name
        }, function (data) {
            if (!data) {
                $('#conversation').append(" sorry receiver not connected" + '<br>');
            }
        });
    });

    //update the chat box on receiving message from the server
    socket.on('updateChat', function (data) {
        showChatBox();
        socketReceiver = data.receiverId;
        $('#conversation').append( data.id +":" + data.msg + '<br>');
    });

    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });

    //set the query params in the navigation url
    $('a.nav-link.link').attr("href", (n,v) =>{
        return v+"?user="+userId;
    });

    //set the address of the restaurant on select
    $('.options').on('click','option', function() {
        var value = $(this).attr('id');
        let selectedRestaurantAddress= registeredRestaurants.filter(m => m.userId === value)[0].address;
        $('#selected-restaurant-address').val(selectedRestaurantAddress);
    });

});

const uploadProductDetails = () => {
    let image = $(".item-image")[0].files[0];
    let storage = firebase.storage().ref();
    let item = {
        id: Date.now(),
        userId: userId,
        itemName: $("#item-name").val(),
        category: $("#category").val(),
        productDescription: $("#product-description").val(),
        ownerName: $("#owner-name").val(),
        restaurantName: $("#restaurant-name").val(),
        contactNumber: $("#contact-number").val(),
        email: $("#email").val(),
        address: userAddress,
        city: userCity.toLowerCase(),
        pickupTime: $("#pick-up-timing").val(),
        listTime: $("#list-time").val()
    };
        $.ajax({
            url: 'http://localhost:5000/addProduct',
            data: item,
            dataType: 'text',
            type: 'POST',
            success: function () {
                // storing the image in firebase storage
                if( image !== undefined) {
                    storage.child('images/' + item.id).put(image);
                }
            },
            error: function () {
                $("#error").removeClass("hidden").append("error occurred in adding user data");
            },
        });
};

const getRegisteredRestaurants = () => {
    $.ajax({
        url: 'http://localhost:5000/getRegisteredRestaurants',
        dataType: 'json',
        type: 'GET',
        success: function (data) {
            registeredRestaurants = data;
            setRestaurantList();
            $('#error').addClass('hidden');
        },
        error: function () {
            $("#error").removeClass("hidden").append("error occurred in adding user data");
        },
    });
};
const getUserDetails = () => {
    $.ajax({
        url: 'http://localhost:5000/getUserDetails/'+userId,
        dataType: 'json',
        type: 'GET',
        success: function (data) {
            user = data;
            $('#error').addClass('hidden');
        },
        error: function () {
            $("#error").removeClass("hidden").html("error occurred while fetching user details");
        },
    });
};
const setRestaurantList = () => {
    let data = registeredRestaurants;
    let source = document.getElementById('entry-template').innerHTML;
    let template = Handlebars.compile(source);
    let html = template({data});
    $('.options').html(html);
};
const showIndividualUpload = () => {
    $("#product_upload")[0].reset();
    $("#restaurant-name-div").addClass("hidden");
    $("#restaurant").removeClass("active");
    $("#individual").addClass("active");
    $('.show-individual').removeClass("hidden");
    $('.donate-to-restaurant').addClass("hidden");
};
const showRestaurantUpload = () => {
    $("#product_upload")[0].reset();
    $("#restaurant-name-div").removeClass("hidden");
    $("#restaurant").addClass("active");
    $("#individual").removeClass("active");
    $('.show-individual').addClass("hidden");
    showDonateAsIndividual();
};
const showDonateToRestaurantFields= () => {
    donateAsIndividual=false;
    $(".individual").addClass('hidden');
    $(".donate-to-restaurant").removeClass('hidden');
    if(registeredRestaurants === null || registeredRestaurants === undefined) {
        getRegisteredRestaurants();
    }
};
const showDonateAsIndividual= () => {
    donateAsIndividual=true;
    $(".individual").removeClass('hidden');
    $(".donate-to-restaurant").addClass('hidden');
};


const showChatBox =() => {
    $("#chat-container").removeClass("hidden");
};