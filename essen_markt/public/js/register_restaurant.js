let userId= getQueryVariable("user");
$(document).ready(() => {
    $('a.nav-link.link').attr("href", (n,v) =>{
        return v+"?user="+userId;
    });
    getCurrentLocation();
});
const registerRestaurant = ()=> {
    event.preventDefault();
    let detail = {
        userId: userId,
        ownerName: $("#owner-name").val(),
        restaurantName: $("#restaurant-name").val(),
        contactNumber: $("#contact-number").val(),
        email: $("#email").val(),
        address: userAddress,
        city: userCity
    };
    $.ajax({
        url: 'http://localhost:5000/registerRestaurant',
        data: detail,
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