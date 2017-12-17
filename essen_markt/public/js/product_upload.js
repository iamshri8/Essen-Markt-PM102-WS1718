let userAddress;
let userCity;
let userZipCode;
$(document).ready(() => {
    $('.show-individual').addClass("hidden");
    $(".dropdown-menu").on('click', 'li a', function () {
        $(this).parent().parent().siblings(".btn:first-child").html($(this).text() + ' <span class="caret"></span>');
        $(this).parent().parent().siblings(".btn:first-child").val($(this).text());
    });

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
    let image = $("#item-image")[0].files[0];
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
        address: {
            fullAddress: userAddress,
            city: userCity,
            zip: userZipCode
        },
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
            storage.child('images/' + item.id).put(image);

        },
        error: function () {
            $("#error").removeClass("hidden").append("error occurred in adding user data");
        },
    });
};
const showIndividualUpload = () => {
    $("#restaurant-name-div").addClass("hidden");
    $("#restaurant").removeClass("active");
    $("#individual").addClass("active");
    $('.show-individual').removeClass("hidden");
};

const showRestaurantUpload = () => {
    $("#restaurant-name-div").removeClass("hidden");
    $("#restaurant").addClass("active");
    $("#individual").removeClass("active");
    $('.show-individual').addClass("hidden");
};
const showDonateToRestaurantFields= () => {
    
};