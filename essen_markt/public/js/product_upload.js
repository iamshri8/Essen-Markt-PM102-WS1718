let userAddress;
let userCity;
let userZipCode;
let userId= getQueryVariable("user");
let registeredRestaurants;
let user;
let socketReceiver='lsfoZnaxG5c0sN8XEGlc50W1Cdz2';
let isDonateToRestaurant=false;
let selectedRestaurant;
let socket = io.connect('http://localhost:5000/');


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
    $(':input:hidden').attr('disabled', true);
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

    socket.on('respondRequest', function (data) {
        if(data) {
            donateToRestaurant();
        } else {
            $("#form-error").html("owner declined your request");
        }
    });
    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
    
    socket.on("donateRequest", function (data) {
        $("#snackbar").addClass("show");
        socketReceiver = data.receiverId;
    });

    $("#product_upload").submit(function (event) {
        event.preventDefault();
        if(isDonateToRestaurant) {
            if(socketReceiver === userId){
                $("#form-error").html("sorry !! you are the restaurant owner and you can directly upload the product");
            } else {
                socket.emit("donateRequest", {
                    receiverId: socketReceiver,
                    senderId: userId,
                    senderName: user.name
                }, function (data) {
                    if (!data) {
                        $('#form-error').append(" sorry receiver not connected" + '<br>');
                    }
                });
            }
        } else {
           donateAsIndividual();
        }
    });
    //set the query params in the navigation url
    $('a.nav-link.link').attr("href", (n,v) =>{
        return v+"?user="+userId;
    });

    //set the address of the restaurant on select
    $('.options').on('click','option', function() {
        let value = $(this).attr('id');
        selectedRestaurant= registeredRestaurants.filter(m => m.userId === value)[0];
        let selectedRestaurantAddress= selectedRestaurant.address;
        socketReceiver = selectedRestaurant.userId;
        $('#selected-restaurant-address').html(selectedRestaurantAddress);
    });

});

const donateToRestaurant = () => {
    let item = {
        id: Date.now(),
        userId: userId,
        itemName: $("#item-name").val(),
        category: $("#category").val().toLowerCase(),
        productDescription: $("#product-description").val(),
        ownerName: selectedRestaurant.ownerName,
        restaurantName: selectedRestaurant.restaurantName,
        contactNumber: selectedRestaurant.contactNumber,
        email: selectedRestaurant.email,
        address: selectedRestaurant.address,
        city: selectedRestaurant.city,
        pickupTime: $("#pick-up-timing").val(),
        listTime: $("#list-time").val()
    };
    let image = $(".item-image")[0].files[0];
    let storage = firebase.storage().ref();
    // storing the image in firebase storage
    if( image !== undefined) {
        var uploadTask = storage.child('images/' + item.id).put(image);
        uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
            }, function () {
                let downloadUrl = uploadTask.snapshot.downloadURL;
                item.imgUrl= downloadUrl;
                uploadProductDetails(item);
            }
        )
    }else {
        uploadProductDetails(item);
    }
};
const donateAsIndividual = () => {
    let item = {
        id: Date.now(),
        userId: userId,
        itemName: $("#item-name").val(),
        category: $("#category").val().toLowerCase(),
        productDescription: $("#product-description").val(),
        ownerName: $("#owner-name").val(),
        restaurantName: $("#restaurant-name").val(),
        contactNumber: $("#contact-number").val(),
        email: $("#email").val(),
        address: userAddress,
        city: userCity.toLowerCase(),
        pickupTime: $("#pick-up-timing").val(),
        listTime: $("#list-time").val(),
        imgUrl: ""
    };
    let image = $(".item-image")[0].files[0];
    let storage = firebase.storage().ref();
    // storing the image in firebase storage
    if( image !== undefined) {
        var uploadTask = storage.child('images/' + item.id).put(image);
        uploadTask.on('state_changed', function (snapshot) {
            }, function (error) {
            }, function () {
             let downloadUrl = uploadTask.snapshot.downloadURL;
             item.imgUrl= downloadUrl;
             uploadProductDetails(item);
            }
        )
    }else {
        uploadProductDetails(item);
    }
};
const uploadProductDetails = (item) => {
        $.ajax({
            url: 'http://localhost:5000/addProduct',
            data: item,
            dataType: 'text',
            type: 'POST',
            success: function () {
                $("#form-success").html("Product donated successfully")
                $("#form-error").html("");
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
const clearErrors=() =>{
    $("#error").addClass("hidden");
    $("#form-error").html("");
    $("#form-success").html("");
};
const showIndividualUpload = () => {
    $("#product_upload")[0].reset();
    clearErrors();
    $(':input:hidden').attr('disabled', false);
    $("#restaurant-name-div").addClass("hidden");
    $("#restaurant").removeClass("active");
    $("#individual").addClass("active");
    $('.show-individual').removeClass("hidden");
    $('.donate-to-restaurant').addClass("hidden");
    $(':input:hidden').attr('disabled', true);
};
const showRestaurantUpload = () => {
    $("#product_upload")[0].reset();
    clearErrors();
    $(':input:hidden').attr('disabled', false);
    $("#restaurant-name-div").removeClass("hidden");
    $("#restaurant").addClass("active");
    $("#individual").removeClass("active");
    $('.show-individual').addClass("hidden");
    showDonateAsIndividual();
};
const showDonateToRestaurantFields= () => {
    $(':input:hidden').attr('disabled', false);
    isDonateToRestaurant= true;
    clearErrors();
    $(".individual").addClass('hidden');
    $(".donate-to-restaurant").removeClass('hidden');
    $(':input:hidden').attr('disabled', true);
    if(registeredRestaurants === null || registeredRestaurants === undefined) {
        getRegisteredRestaurants();
    }
};
const showDonateAsIndividual= () => {
    isDonateToRestaurant = false;
    clearErrors();
    $(':input:hidden').attr('disabled', false);
    $(".individual").removeClass('hidden');
    $(".donate-to-restaurant").addClass('hidden');
    $(':input:hidden').attr('disabled', true);
};


const showChatBox =() => {
    if(selectedRestaurant === "" || selectedRestaurant === undefined) {
        $("#form-error").html("please select a restaurant");
    } else  {
        $(':input:hidden').attr('disabled', false);
        $("#chat-container").removeClass("hidden");
        $(':input:hidden').attr('disabled', true);
    }
};

const sendResponse = (data) => {
    socket.emit("respondRequest", {
        result: data,
        receiverId: socketReceiver
    });
    $("#snackbar").removeClass("show");
};