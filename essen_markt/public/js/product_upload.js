let userAddress;
let userCity;
let userZipCode;
let userId= getQueryVariable("user");
let registeredRestaurants;
var socket = io.connect('http://localhost:5000/');

// Connect to server
socket.on('connect', function(){
    // send the server, userId of the connected user
    console.log("emit");
    socket.emit('addUser', userId);
});
$(document).ready(() => {
    // when the client clicks SEND
    $('#datasend').click( function() {
        var message = $('#data').val();
        $('#data').val('');
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendChat',{msg: message, receiverId: 'bala', senderId:userId}, function (data) {
            if(!data) {
                $('#conversation').append( " sorry receiver not connected"+ '<br>');
            }
        });
    });
    socket.on('updateChat', function (data) {
        showChatBox();
        $('#conversation').append( data.id +":" + data.msg + '<br>');
    });
    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
    $("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
    $('#chat-container').addClass('hidden');
    $('.show-individual').addClass("hidden");

    $('a.nav-link.link').attr("href", (n,v) =>{
        return v+"?user="+userId;
    });
    $('.options').on('click','option', function() {
        var value = $(this).attr('id');
        let selectedRestaurantAddress= registeredRestaurants.filter(m => m.email === value)[0].address.fullAddress;
        $('#selected-restaurant-address').val(selectedRestaurantAddress);
    });
    $('.donate-to-restaurant').addClass("hidden");

    getCurrentLocation();
});
const getCurrentLocation = () => {
    let x = navigator.geolocation;
    x.getCurrentPosition(success, failure);

    function success(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        showMap(latitude, longitude);
    }

    function failure() {
        //setting latitude and longitude for Frankfurt
        showMap(50.110924, 8.682127);
    }
};

const showMap = (latitude, longitude) => {
    let map;
    let marker;
    let myLatlng = new google.maps.LatLng(latitude, longitude);

    let mapOptions = {
        zoom: 18,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("myMap"), mapOptions);

    marker = new google.maps.Marker({
        map: map,
        position: myLatlng,
        draggable: true
    });

    showAddressOnMarker(myLatlng, map, marker);

    google.maps.event.addListener(marker, 'dragend', function () {
        showAddressOnMarker(marker.getPosition(), map, marker);
    });
};

const showAddressOnMarker = (position, map, marker) => {
    let geocoder = new google.maps.Geocoder();
    let infowindow = new google.maps.InfoWindow();
    geocoder.geocode({'latLng': position}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                userAddress = results[0].formatted_address;
                userCity= results[0].address_components[3].long_name;
                userZipCode= results[0].address_components[6].long_name;
                infowindow.setContent(results[0].formatted_address);
                infowindow.open(map, marker);
            }
        }
    });
};
const uploadProductDetails = () => {
    let image = $(".item-image")[0].files[0];
    let storage = firebase.storage().ref();
    let item = {
        id: Date.now(),
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
const setRestaurantList = () => {
    let data = registeredRestaurants;
    let source = document.getElementById('entry-template').innerHTML;
    let template = Handlebars.compile(source);
    let html = template({data});
    $('.options').html(html);
};
const showIndividualUpload = () => {
    $("#restaurant-name-div").addClass("hidden");
    $("#restaurant").removeClass("active");
    $("#individual").addClass("active");
    $('.show-individual').removeClass("hidden");
    $('.donate-to-restaurant').addClass("hidden");
    clearFormValues();
};
const showRestaurantUpload = () => {
    $("#restaurant-name-div").removeClass("hidden");
    $("#restaurant").addClass("active");
    $("#individual").removeClass("active");
    $('.show-individual').addClass("hidden");
    showDonateAsIndividual();
    clearFormValues();
};
const showDonateToRestaurantFields= () => {
    $(".individual").addClass('hidden');
    $(".donate-to-restaurant").removeClass('hidden');
    if(registeredRestaurants === null || registeredRestaurants === undefined) {
        getRegisteredRestaurants();
    }
};
const showDonateAsIndividual= () => {
    $(".individual").removeClass('hidden');
    $(".donate-to-restaurant").addClass('hidden');
};

const clearFormValues = () => {
    $('.form-control').val("");
    $('#category').html("Select Category");
    $('#list-time').html("--Select--")
    $('#category').val("");
    $('#list-time').val("");
};

const registerRestaurant = ()=> {
    let detail = {
        ownerName: $("#owner-name").val(),
        restaurantName: $("#restaurant-name").val(),
        contactNumber: $("#contact-number").val(),
        email: $("#email").val(),
        address: {
            fullAddress: userAddress,
            city: userCity,
            zip: userZipCode
        },
    };
    $.ajax({
        url: 'http://localhost:5000/registerRestaurant',
        data: item,
        dataType: 'text',
        type: 'POST',
        success: function () {
            $('#error').addClass('hidden');
        },
        error: function () {
            $("#error").removeClass("hidden").append("error occurred in adding user data");
        },
    });
};
const validateForm = (item ) => {
    if (item.id === '' || item.category === '' || item.ownerName ===''
        || item.restaurantName === '' || item.contactNumber === '' || item.email === ''
        || item.pickupTime === '' || item.listTime === '') {
        $('#error').removeClass('hidden').html("please fill in all the mandatory fields");
        return false;

    }
    if( !(/^\d+$/.test(item.contactNumber))) {
        $('#error').removeClass('hidden').html("please enter valid contact number");
        return false;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(item.email))) {
        $('#error').removeClass('hidden').html("please enter valid email id");
        return false;
    }
    return true;
};

const showChatBox =() => {
    $("#chat-container").removeClass("hidden");
};